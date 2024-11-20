export default function buildSearchUrl(query?: string, sortBy?: string, title?: string, author?: string, doi?: string, years?: string[]) {
    let searchUrl = `/search?q=${query}`

    if (sortBy) {
        searchUrl += `&sort=${sortBy}`
    }
    if (title && title.length > 0) {
        searchUrl += `&title=${title}`
    }
    if (author && author.length > 0) {
        searchUrl += `&author=${author}`
    }
    if (doi && doi.length > 0) {
        searchUrl += `&doi=${doi}`
    }
    if(years && years.length > 0) {
        searchUrl += `&years=${years.join(',')}`
    }

    return searchUrl
}