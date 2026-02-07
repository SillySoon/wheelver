// src/utils/stringUtils.ts

/**
 * Escapes special characters in a string for use in a regular expression.
 */
export const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Converts a search string into a fuzzy regex pattern that matches diacritics/accents
 * and ignores non-alphanumeric character differences (like hyphens, spaces).
 * For example, 'mazda mx5' will match 'Mazda MX-5'.
 */
export const diacriticSensitiveRegex = (search: string): string => {
    const diacriticsMap: { [key: string]: string } = {
        'a': '[aàáâãäåāăą]',
        'A': '[AÀÁÂÃÄÅĀĂĄ]',
        'e': '[eèéêëēĕėęě]',
        'E': '[EÈÉÊËĒĔĖĘĚ]',
        'i': '[iìíîïĩīĭįı]',
        'I': '[IÌÍÎÏĨĪĬĮİ]',
        'o': '[oòóôõöøōŏő]',
        'O': '[OÒÓÔÕÖØŌŎŐ]',
        'u': '[uùúûüũūŭůűų]',
        'U': '[UÙÚÛÜŨŪŬŮŰŲ]',
        'c': '[cçćĉċč]',
        'C': '[CÇĆĈĊČ]',
        'd': '[dďđ]',
        'D': '[DĎĐ]',
        'g': '[gĝğġģ]',
        'G': '[GĜĞĠĢ]',
        'h': '[hĥħ]',
        'H': '[HĤĦ]',
        'j': '[jĵ]',
        'J': '[JĴ]',
        'k': '[kķĸ]',
        'K': '[KĶ]',
        'l': '[lĺļľŀł]',
        'L': '[LĹĻĽĿŁ]',
        'n': '[nñńņňŉŋ]',
        'N': '[NÑŃŅŇŊ]',
        'r': '[rŕŗř]',
        'R': '[RŔŖŘ]',
        's': '[sśŝşš]',
        'S': '[SŚŜŞŠ]',
        't': '[tţťŧ]',
        'T': '[TŢŤŦ]',
        'w': '[wŵ]',
        'W': '[WŴ]',
        'y': '[yýÿŷ]',
        'Y': '[YÝŸŶ]',
        'z': '[zźżž]',
        'Z': '[ZŹŻŽ]'
    };

    // Filter out non-alphanumeric characters from search query for fuzzier matching
    const cleanSearch = search.replace(/[^a-zA-Z0-9]/g, '');
    
    if (cleanSearch.length === 0) {
        return escapeRegExp(search);
    }

    const separator = '[^a-zA-Z0-9]*';
    return cleanSearch
        .split('')
        .map(char => diacriticsMap[char] || char)
        .join(separator);
};
