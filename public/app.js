// DOM Elements
const productForm = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const alertsContainer = document.getElementById('alerts');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const showAllBtn = document.getElementById('show-all');
const showLowStockBtn = document.getElementById('show-low-stock');

// State
let editingProductId = null;
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    productForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', resetForm);
    showAllBtn.addEventListener('click', () => {
        currentFilter = 'all';
        loadProducts();
    });
    showLowStockBtn.addEventListener('click', () => {
        currentFilter = 'low-stock';
        loadProducts();
    });
}

// Form Handling
async function handleFormSubmit(e) {
    e.preventDefault();

    const productData = {
        name: document.getElementById('product-name').value,
        sku: document.getElementById('product-sku').value,
        description: document.getElementById('product-description').value,
        quantity: parseInt(document.getElementById('product-quantity').value) || 0,
        min_quantity: parseInt(document.getElementById('product-min-quantity').value) || 0,
        price: parseFloat(document.getElementById('product-price').value) || 0,
        category: document.getElementById('product-category').value
    };

    try {
        if (editingProductId) {
            await updateProduct(editingProductId, productData);
            showAlert('商品を更新しました', 'success');
        } else {
            await createProduct(productData);
            showAlert('商品を登録しました', 'success');
        }
        resetForm();
        loadProducts();
    } catch (error) {
        showAlert('エラーが発生しました: ' + error.message, 'error');
    }
}

function resetForm() {
    productForm.reset();
    editingProductId = null;
    document.getElementById('product-id').value = '';
    formTitle.textContent = '新規商品登録';
    submitBtn.textContent = '登録';
    cancelBtn.style.display = 'none';
}

// API Functions
async function createProduct(productData) {
    const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
    }

    return response.json();
}

async function updateProduct(id, productData) {
    const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update product');
    }

    return response.json();
}

async function deleteProduct(id) {
    const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete product');
    }

    return response.json();
}

async function adjustQuantity(id, adjustment) {
    const response = await fetch(`/api/products/${id}/quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustment })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to adjust quantity');
    }

    return response.json();
}

async function loadProducts() {
    try {
        const endpoint = currentFilter === 'low-stock' 
            ? '/api/products/alerts/low-stock'
            : '/api/products';
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error('Failed to load products');
        }

        const data = await response.json();
        displayProducts(data.products);
    } catch (error) {
        productList.innerHTML = `<p class="loading">エラー: ${error.message}</p>`;
    }
}

// Display Functions
function displayProducts(products) {
    if (products.length === 0) {
        productList.innerHTML = `
            <div class="empty-state">
                <p>📦 商品が登録されていません</p>
                <p style="font-size: 0.9rem;">上のフォームから商品を登録してください</p>
            </div>
        `;
        return;
    }

    productList.innerHTML = products.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    const isLowStock = product.quantity <= product.min_quantity;
    const quantityClass = product.quantity === 0 ? 'quantity-out' : 
                         isLowStock ? 'quantity-low' : 'quantity-ok';
    
    return `
        <div class="product-card ${isLowStock ? 'low-stock' : ''}">
            <div class="product-header">
                <div>
                    <div class="product-name">${escapeHtml(product.name)}</div>
                    ${product.sku ? `<div class="product-sku">SKU: ${escapeHtml(product.sku)}</div>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn-icon btn-edit" onclick="editProduct(${product.id})">✏️ 編集</button>
                    <button class="btn-icon btn-delete" onclick="confirmDelete(${product.id})">🗑️ 削除</button>
                </div>
            </div>
            
            ${product.description ? `<div class="product-description">${escapeHtml(product.description)}</div>` : ''}
            
            <div class="product-info">
                <div class="info-item">
                    <span class="info-label">在庫数</span>
                    <span class="quantity-badge ${quantityClass}">${product.quantity}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">最小在庫数</span>
                    <span class="info-value">${product.min_quantity}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">価格</span>
                    <span class="info-value">¥${product.price.toLocaleString()}</span>
                </div>
                ${product.category ? `
                <div class="info-item">
                    <span class="info-label">カテゴリー</span>
                    <span class="info-value">${escapeHtml(product.category)}</span>
                </div>
                ` : ''}
            </div>

            <div class="stock-adjustment">
                <input type="number" id="adjustment-${product.id}" placeholder="±数量" style="width: 100px;">
                <button class="btn btn-small btn-primary" onclick="handleStockAdjustment(${product.id})">
                    在庫調整
                </button>
            </div>
        </div>
    `;
}

// Product Actions
async function editProduct(id) {
    try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error('Failed to load product');
        
        const data = await response.json();
        const product = data.product;

        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-sku').value = product.sku || '';
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-quantity').value = product.quantity;
        document.getElementById('product-min-quantity').value = product.min_quantity;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-category').value = product.category || '';

        editingProductId = id;
        formTitle.textContent = '商品編集';
        submitBtn.textContent = '更新';
        cancelBtn.style.display = 'inline-block';

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        showAlert('商品の読み込みに失敗しました', 'error');
    }
}

async function confirmDelete(id) {
    if (confirm('この商品を削除してもよろしいですか？')) {
        try {
            await deleteProduct(id);
            showAlert('商品を削除しました', 'success');
            loadProducts();
        } catch (error) {
            showAlert('削除に失敗しました: ' + error.message, 'error');
        }
    }
}

async function handleStockAdjustment(id) {
    const input = document.getElementById(`adjustment-${id}`);
    const adjustment = parseInt(input.value);

    if (!adjustment || adjustment === 0) {
        showAlert('調整数量を入力してください', 'warning');
        return;
    }

    try {
        await adjustQuantity(id, adjustment);
        showAlert(`在庫を${adjustment > 0 ? '+' : ''}${adjustment}調整しました`, 'success');
        input.value = '';
        loadProducts();
    } catch (error) {
        showAlert('在庫調整に失敗しました: ' + error.message, 'error');
    }
}

// Utility Functions
function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertsContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
