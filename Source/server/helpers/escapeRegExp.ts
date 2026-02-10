// Hàm hỗ trợ xóa bỏ các ký tự đặc biệt cho Regex
export const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};