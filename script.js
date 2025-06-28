// Vérification de l'initialisation de Supabase
if (!window.supabaseClient) {
    console.error('Client Supabase non disponible');
    throw new Error('Supabase non initialisé');
}

const supabase = window.supabaseClient;
console.log('Client Supabase récupéré:', supabase);

let isConnected = false;

// Gestionnaire de connexion Supabase
const connectionStatus = document.getElementById('connection-status')
const statusText = connectionStatus.querySelector('.status-text')

// Améliorer la fonction checkConnection
async function checkConnection() {
    try {
        connectionStatus.classList.remove('hidden');
        console.log('Test de connexion à la base de données...');
        
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .limit(1);

        console.log('Résultat du test:', { data, error });

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }
        
        if (!data) {
            throw new Error('No data received from database');
        }

        console.log('Données reçues:', data);
        
        isConnected = true;
        statusText.textContent = 'Connecté';
        connectionStatus.style.backgroundColor = 'var(--accent-primary)';
        return true;
    } catch (error) {
        console.error('Erreur détaillée:', error);
        statusText.textContent = 'Déconnecté';
        connectionStatus.style.backgroundColor = '#ff4444';
        showError(`Erreur de connexion: ${error.message}`);
        return false;
    }
}

// État de l'application
let allProducts = []
let categories = []

// Pagination state
const PAGE_SIZE = 12
let currentPage = 1
let totalProducts = 0

// Éléments DOM
const productsGrid = document.getElementById('products-grid')
const searchInput = document.getElementById('searchInput')
const categoryFilter = document.getElementById('categoryFilter')
const loadingSpinner = document.getElementById('loading-spinner')
const errorMessage = document.getElementById('error-message')
const prevPageBtn = document.getElementById('prevPage')
const nextPageBtn = document.getElementById('nextPage')
const pageInfo = document.getElementById('pageInfo')

// Initialisation
async function init() {
    toggleLoading(true);
    await checkConnection();
    if (!isConnected) {
        showError('Impossible de se connecter à la base de données');
        toggleLoading(false);
        return;
    }
    await loadCategories()
    await loadProducts()
    setupEventListeners()
    setupRealtimeSubscription()
    toggleLoading(false);
}

// Chargement des catégories
async function loadCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('nom')
    
    if (error) {
        console.error('Erreur lors du chargement des catégories:', error)
        return
    }

    categories = data
    updateCategoryFilter()
}

// Mise à jour du select des catégories
function updateCategoryFilter() {
    categoryFilter.innerHTML = '<option value="">Toutes les catégories</option>'
    categories.forEach(category => {
        const option = document.createElement('option')
        option.value = category.id
        option.textContent = category.nom
        categoryFilter.appendChild(option)
    })
}

// Show/hide loading spinner
function toggleLoading(show) {
    loadingSpinner.classList.toggle('hidden', !show)
}

// Show error message
function showError(message) {
    errorMessage.textContent = message
    errorMessage.classList.remove('hidden')
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);
    
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`;
}

// Chargement des produits
async function loadProducts() {
    console.log('Début chargement produits...');
    try {
        const startRange = (currentPage - 1) * PAGE_SIZE;
        const endRange = startRange + PAGE_SIZE - 1;

        // FIX: Use the same select as in filterProducts for correct category join
        const { data, error, count } = await supabase
            .from('produits')
            .select('*, categories!inner(*)', { count: 'exact' })
            .range(startRange, endRange);

        if (error) throw error;

        totalProducts = count || 0;
        allProducts = data || [];
        renderProducts(allProducts);
        updatePagination();
        
        console.log(`Chargés ${data?.length} produits sur ${count} total`);
    } catch (error) {
        console.error('Erreur chargement:', error);
        showError(`Erreur de chargement: ${error.message}`);
    } finally {
        toggleLoading(false);
    }
}

// Add this helper function for HTML escaping
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Add new state management
let isModalOpen = false;
let lastSearchQuery = '';
let isLoading = false;

// Enhanced renderProducts with better error handling
function renderProducts(products) {
    if (!products?.length) {
        productsGrid.innerHTML = `
            <div class="no-products-message">
                <p>Aucun produit trouvé</p>
                <p>Essayez de modifier vos critères de recherche</p>
            </div>`;
        return;
    }

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" onclick="showProductDetails(${product.id})">
            <div class="image-wrapper">
                <img src="${product.image_url}" alt="${product.nom}">
            </div>
            <div class="product-info-block">
                <div class="product-name">${product.nom}</div>
                <div class="product-category">${product.categories?.nom || ''}</div>
                <div class="product-price">${Number(product.prix_detail || 0).toLocaleString()} FCFA</div>
            </div>
        </div>
    `).join('');
}

// Improved modal handling
window.showProductDetails = function(productId) {
    if (isModalOpen || isLoading) return;
    
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    isModalOpen = true;
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <span class="close-modal" onclick="closeProductModal()">&times;</span>
        <div class="product-details">
            <img src="${escapeHtml(product.image_url || 'placeholder.jpg')}" 
                 alt="${escapeHtml(product.nom)}"
                 onerror="this.onerror=null; this.src='placeholder.jpg';"
                 loading="lazy">
            <div class="product-info">
                <h2>${escapeHtml(product.nom)}</h2>
                <p class="product-category">${escapeHtml(product.categories?.nom || 'Non catégorisé')}</p>
                <p class="product-description">
                    ${escapeHtml(product.description || 'Aucune description disponible')}
                </p>
                <div class="product-prices">
                    <div class="prix-detail">
                        <span class="prix-label">Prix détail&nbsp;:</span>
                        <span class="prix-value">${Number(product.prix_detail || 0).toLocaleString()} FCFA</span>
                    </div>
                    <div class="prix-gros">
                        <span class="prix-label">Prix en gros&nbsp;:</span>
                        <span class="prix-value">${Number(product.prix_gros || 0).toLocaleString()} FCFA</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.closeProductModal = function() {
    if (!isModalOpen) return;
    
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    isModalOpen = false;
}

// Add new setupEventListeners function
function setupEventListeners() {
    let searchTimeout;
    
    const handleSearch = (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => filterProducts(), 300);
    };
    
    const handleCategoryChange = () => {
        currentPage = 1; // Reset pagination
        filterProducts();
    };
    
    searchInput.addEventListener('input', handleSearch);
    categoryFilter.addEventListener('change', handleCategoryChange);
    
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            filterProducts();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        filterProducts();
    });
    
    // Cleanup function
    return () => {
        searchInput.removeEventListener('input', handleSearch);
        categoryFilter.removeEventListener('change', handleCategoryChange);
    };
}

// Improved filter products with debouncing and pagination reset
async function filterProducts() {
    if (isLoading) return;
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    const categoryId = categoryFilter.value;
    
    if (searchTerm !== lastSearchQuery) {
        currentPage = 1;
        lastSearchQuery = searchTerm;
    }
    
    isLoading = true;
    toggleLoading(true);
    
    try {
        const startRange = (currentPage - 1) * PAGE_SIZE;
        const endRange = startRange + PAGE_SIZE - 1;

        let query = supabase
            .from('produits')
            .select('*, categories!inner(*)', { count: 'exact' });

        if (searchTerm) {
            query = query.ilike('nom', `%${searchTerm}%`);
        }

        // FIX: Check for empty string, not 'all'
        if (categoryId) {
            // Changed to use the correct foreign key relationship
            query = query.eq('categories.id', categoryId);
        }

        query = query.range(startRange, endRange);

        const { data, error, count } = await query;
        if (error) throw error;
        
        totalProducts = count || 0;
        allProducts = data || [];
        renderProducts(data);
        updatePagination();
        
        console.log(`Filtrés ${data?.length} produits sur ${count} total`);
    } catch (error) {
        console.error('Erreur filtrage:', error);
        showError(`Erreur de filtrage: ${error.message}`);
    } finally {
        isLoading = false;
        toggleLoading(false);
    }
}

// Add setupRealtimeSubscription function
function setupRealtimeSubscription() {
    const subscription = supabase
        .channel('public:produits')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'produits' }, loadProducts)
        .subscribe();
}

// Démarrage de l'application
init()

// Ajouter une fonction de reconnexion
async function reconnect() {
    if (!isConnected) {
        await checkConnection();
        if (isConnected) {
            await loadProducts();
        }
    }
}

// Replace multiple setInterval calls with a single one
let reconnectionInterval;

function startReconnectionInterval() {
    if (!reconnectionInterval) {
        reconnectionInterval = setInterval(reconnect, 5000);
    }
}

// Call this in init()
startReconnectionInterval();

window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Global error:', error);
    showError('Une erreur est survenue. Veuillez rafraîchir la page.');
    return false;
};

