import asyncio
from playwright.async_api import async_playwright, Browser, Page
from bs4 import BeautifulSoup
import httpx
import re
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import logging
from ...core.config import settings
from ...schemas.schemas import PriceComparisonBase, Availability, ScrapeResult

logger = logging.getLogger(__name__)


class ScraperService:
    """
    Web scraping multi-source con Playwright
    - Supporta JavaScript rendering
    - Rate limiting rispettoso
    - Caching risultati
    - Fallback su ScraperAPI per siti difficili
    """
    
    def __init__(self):
        self.browser: Optional[Browser] = None
        self.cache: Dict[str, Any] = {}  # Simple in-memory cache
        self.cache_ttl = settings.CACHE_TTL
        
    async def init_browser(self):
        """Inizializza browser Playwright"""
        if self.browser is None:
            playwright = await async_playwright().start()
            self.browser = await playwright.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-dev-shm-usage']
            )
    
    async def close(self):
        """Chiude il browser"""
        if self.browser:
            try:
                await self.browser.close()
            except Exception as e:
                logger.warning(f"Error closing browser: {e}")
            finally:
                self.browser = None
    
    async def search_all_sources(
        self, 
        query: str, 
        barcode: Optional[str] = None,
        sources: List[str] = None
    ) -> List[ScrapeResult]:
        """Cerca su tutti i source in parallelo"""
        
        if sources is None:
            sources = ["amazon", "eprice", "unieuro", "mediaworld", "trovaprezzi"]
        
        await self.init_browser()
        
        # Esegui scraping in parallelo
        tasks = []
        for source in sources:
            if source == "amazon":
                tasks.append(self._scrape_amazon(query, barcode))
            elif source == "eprice":
                tasks.append(self._scrape_eprice(query, barcode))
            elif source == "unieuro":
                tasks.append(self._scrape_unieuro(query, barcode))
            elif source == "mediaworld":
                tasks.append(self._scrape_mediaworld(query, barcode))
            elif source == "trovaprezzi":
                tasks.append(self._scrape_trovaprezzi(query, barcode))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Processa risultati
        scrape_results = []
        for i, result in enumerate(results):
            source = sources[i]
            if isinstance(result, Exception):
                logger.error(f"Scrape error for {source}: {result}")
                scrape_results.append(ScrapeResult(
                    source=source,
                    results=[],
                    scraped_at=datetime.utcnow(),
                    success=False,
                    error=str(result)
                ))
            else:
                scrape_results.append(ScrapeResult(
                    source=source,
                    results=result,
                    scraped_at=datetime.utcnow(),
                    success=True
                ))
        
        return scrape_results
    
    async def _get_page(self) -> Page:
        """Crea una nuova pagina con stealth settings"""
        context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='it-IT'
        )
        page = await context.new_page()
        
        # Block unnecessary resources
        await page.route("**/*.{png,jpg,jpeg,gif,svg,ico,woff,woff2}", lambda route: route.abort())
        
        return page
    
    async def _scrape_amazon(self, query: str, barcode: Optional[str] = None) -> List[PriceComparisonBase]:
        """Scrape Amazon.it"""
        results = []
        page = await self._get_page()
        
        try:
            search_term = barcode if barcode else query
            url = f"https://www.amazon.it/s?k={search_term.replace(' ', '+')}"
            
            await page.goto(url, wait_until='domcontentloaded', timeout=30000)
            await asyncio.sleep(2)  # Rate limiting
            
            # Attendi risultati
            await page.wait_for_selector('[data-component-type="s-search-result"]', timeout=10000)
            
            content = await page.content()
            soup = BeautifulSoup(content, 'lxml')
            
            items = soup.select('[data-component-type="s-search-result"]')[:10]
            
            for item in items:
                try:
                    # Titolo
                    title_el = item.select_one('h2 a span')
                    if not title_el:
                        continue
                    
                    # Link
                    link_el = item.select_one('h2 a')
                    link = f"https://www.amazon.it{link_el['href']}" if link_el else None
                    
                    # Prezzo
                    price_whole = item.select_one('.a-price-whole')
                    price_frac = item.select_one('.a-price-fraction')
                    if price_whole:
                        price_str = price_whole.get_text(strip=True).replace('.', '').replace(',', '')
                        frac = price_frac.get_text(strip=True) if price_frac else '00'
                        price = float(f"{price_str}.{frac}")
                    else:
                        continue
                    
                    # Disponibilità
                    avail_el = item.select_one('.a-color-success')
                    availability = Availability.IN_STOCK if avail_el else Availability.UNKNOWN
                    
                    # Spedizione
                    shipping_el = item.select_one('[data-cy="delivery-recipe"]')
                    shipping_time = shipping_el.get_text(strip=True) if shipping_el else None
                    
                    results.append(PriceComparisonBase(
                        source="amazon",
                        source_url=link,
                        price=price,
                        availability=availability,
                        shipping_time=shipping_time,
                        seller_name="Amazon"
                    ))
                    
                except Exception as e:
                    logger.debug(f"Error parsing Amazon item: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Amazon scrape failed: {e}")
        finally:
            await page.close()
        
        return results
    
    async def _scrape_eprice(self, query: str, barcode: Optional[str] = None) -> List[PriceComparisonBase]:
        """Scrape ePRICE.it"""
        results = []
        page = await self._get_page()
        
        try:
            search_term = barcode if barcode else query
            url = f"https://www.eprice.it/s/?k={search_term.replace(' ', '%20')}"
            
            await page.goto(url, wait_until='domcontentloaded', timeout=30000)
            await asyncio.sleep(1.5)
            
            content = await page.content()
            soup = BeautifulSoup(content, 'lxml')
            
            items = soup.select('.productCard')[:10]
            
            for item in items:
                try:
                    title_el = item.select_one('.productCard__title')
                    if not title_el:
                        continue
                    
                    link_el = item.select_one('a.productCard__link')
                    link = link_el['href'] if link_el else None
                    
                    price_el = item.select_one('.productCard__price')
                    if price_el:
                        price_text = price_el.get_text(strip=True)
                        price_match = re.search(r'[\d.,]+', price_text.replace('.', '').replace(',', '.'))
                        if price_match:
                            price = float(price_match.group())
                        else:
                            continue
                    else:
                        continue
                    
                    results.append(PriceComparisonBase(
                        source="eprice",
                        source_url=link,
                        price=price,
                        availability=Availability.IN_STOCK,
                        seller_name="ePRICE"
                    ))
                    
                except Exception as e:
                    logger.debug(f"Error parsing ePRICE item: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"ePRICE scrape failed: {e}")
        finally:
            await page.close()
        
        return results
    
    async def _scrape_unieuro(self, query: str, barcode: Optional[str] = None) -> List[PriceComparisonBase]:
        """Scrape Unieuro.it"""
        results = []
        page = await self._get_page()
        
        try:
            search_term = barcode if barcode else query
            url = f"https://www.unieuro.it/online/ricerca?q={search_term.replace(' ', '+')}"
            
            await page.goto(url, wait_until='domcontentloaded', timeout=30000)
            await asyncio.sleep(1.5)
            
            content = await page.content()
            soup = BeautifulSoup(content, 'lxml')
            
            items = soup.select('.product-card')[:10]
            
            for item in items:
                try:
                    title_el = item.select_one('.product-card__title')
                    if not title_el:
                        continue
                    
                    link_el = item.select_one('a')
                    link = f"https://www.unieuro.it{link_el['href']}" if link_el else None
                    
                    price_el = item.select_one('.product-card__price')
                    if price_el:
                        price_text = price_el.get_text(strip=True)
                        price_match = re.search(r'[\d.,]+', price_text.replace('.', '').replace(',', '.'))
                        if price_match:
                            price = float(price_match.group())
                        else:
                            continue
                    else:
                        continue
                    
                    results.append(PriceComparisonBase(
                        source="unieuro",
                        source_url=link,
                        price=price,
                        availability=Availability.IN_STOCK,
                        seller_name="Unieuro"
                    ))
                    
                except Exception as e:
                    logger.debug(f"Error parsing Unieuro item: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Unieuro scrape failed: {e}")
        finally:
            await page.close()
        
        return results
    
    async def _scrape_mediaworld(self, query: str, barcode: Optional[str] = None) -> List[PriceComparisonBase]:
        """Scrape MediaWorld.it"""
        results = []
        page = await self._get_page()
        
        try:
            search_term = barcode if barcode else query
            url = f"https://www.mediaworld.it/search?query={search_term.replace(' ', '%20')}"
            
            await page.goto(url, wait_until='domcontentloaded', timeout=30000)
            await asyncio.sleep(1.5)
            
            content = await page.content()
            soup = BeautifulSoup(content, 'lxml')
            
            items = soup.select('[data-test="mms-product-card"]')[:10]
            
            for item in items:
                try:
                    title_el = item.select_one('[data-test="product-title"]')
                    if not title_el:
                        continue
                    
                    link_el = item.select_one('a')
                    link = f"https://www.mediaworld.it{link_el['href']}" if link_el else None
                    
                    price_el = item.select_one('[data-test="product-price"]')
                    if price_el:
                        price_text = price_el.get_text(strip=True)
                        price_match = re.search(r'[\d.,]+', price_text.replace('.', '').replace(',', '.'))
                        if price_match:
                            price = float(price_match.group())
                        else:
                            continue
                    else:
                        continue
                    
                    results.append(PriceComparisonBase(
                        source="mediaworld",
                        source_url=link,
                        price=price,
                        availability=Availability.IN_STOCK,
                        seller_name="MediaWorld"
                    ))
                    
                except Exception as e:
                    logger.debug(f"Error parsing MediaWorld item: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"MediaWorld scrape failed: {e}")
        finally:
            await page.close()
        
        return results
    
    async def _scrape_trovaprezzi(self, query: str, barcode: Optional[str] = None) -> List[PriceComparisonBase]:
        """Scrape TrovaPrezzi.it - aggregatore prezzi"""
        results = []
        page = await self._get_page()
        
        try:
            search_term = barcode if barcode else query
            url = f"https://www.trovaprezzi.it/prezzi_prodotti.aspx?q={search_term.replace(' ', '+')}"
            
            await page.goto(url, wait_until='domcontentloaded', timeout=30000)
            await asyncio.sleep(1.5)
            
            content = await page.content()
            soup = BeautifulSoup(content, 'lxml')
            
            items = soup.select('.item_prodotto')[:10]
            
            for item in items:
                try:
                    title_el = item.select_one('.item_prodotto_nome')
                    if not title_el:
                        continue
                    
                    link_el = title_el.select_one('a')
                    link = link_el['href'] if link_el else None
                    
                    price_el = item.select_one('.item_prodotto_prezzo_offerta')
                    if price_el:
                        price_text = price_el.get_text(strip=True)
                        price_match = re.search(r'[\d.,]+', price_text.replace('.', '').replace(',', '.'))
                        if price_match:
                            price = float(price_match.group())
                        else:
                            continue
                    else:
                        continue
                    
                    seller_el = item.select_one('.item_prodotto_negozio')
                    seller = seller_el.get_text(strip=True) if seller_el else "TrovaPrezzi"
                    
                    results.append(PriceComparisonBase(
                        source="trovaprezzi",
                        source_url=link,
                        price=price,
                        availability=Availability.IN_STOCK,
                        seller_name=seller
                    ))
                    
                except Exception as e:
                    logger.debug(f"Error parsing TrovaPrezzi item: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"TrovaPrezzi scrape failed: {e}")
        finally:
            await page.close()
        
        return results


# Singleton instance
scraper_service = ScraperService()
