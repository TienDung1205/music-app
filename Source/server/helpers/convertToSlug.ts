import unidecode from "unidecode";

export const convertToSlug = (text: string): string => {
    const unidecodeText = unidecode(text.trim()).toLowerCase();
    const slug: string = unidecodeText.replace(/\s+/g, "-");

    return slug;
}