export async function paginateAndScrape(page,)
{
    console.log("Enumerating every Financial Disclosure Document")
    await getEveryLinkOnPage(page)
    
}

async function getEveryLinkOnPage(page)
{
    await page.evaluate(()=>{
        
       let links = document.querySelector("#search-result table a")
       console.log(links)

    })
}