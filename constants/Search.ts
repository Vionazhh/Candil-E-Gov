/**
 * Constants related to search functionality
 * Provides standardized values for search UI and behavior
 */
export const SearchConstants = {
  // Debounce delay in milliseconds for search input
  debounceDelay: 500,
  
  // Empty state messages for different search scenarios
  emptyStates: {
    initial: "Cari buku di perpustakaan",
    initialSubtext: "Masukkan kata kunci untuk menemukan buku",
    noResults: "Tidak ditemukan hasil",
    noResultsSubtext: "Coba kata kunci lain atau ubah filter pencarian",
    error: "Terjadi kesalahan",
    errorSubtext: "Silakan coba lagi nanti",
  },
  
  // Placeholder text for search input
  placeholders: {
    main: "Cari judul, penulis, atau kata kunci...",
    filter: "Filter hasil pencarian...",
  },
  
  // Tab definitions for search types
  tabs: {
    general: {
      id: "general",
      title: "Umum",
      description: "Mencari buku berdasarkan kata kunci di judul, penulis, dan deskripsi",
    },
    phrase: {
      id: "phrase",
      title: "Frasa Lengkap",
      description: "Mencari buku dengan frasa yang persis sama",
    },
  },
  
  // Default values for pagination and results
  defaults: {
    initialPage: 1,
    resultsPerPage: 10,
    maxResultsPerPage: 50,
  },
};

export default SearchConstants; 