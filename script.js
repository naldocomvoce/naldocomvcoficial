// ========================== CART MODULE ==========================
const Cart = {
    items: JSON.parse(localStorage.getItem('cart')) || [],

    add(product) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.quantity++;
        } else {
            product.quantity = 1;
            this.items.push(product);
        }
        this.save();
    },

    remove(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
    },

    adjustQuantity(id, delta) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) this.remove(id);
            else this.save();
        }
    },

    clear() {
        if (confirm('Tem certeza que deseja limpar seu carrinho?')) {
            this.items = [];
            this.save();
            UI.notify('Carrinho limpo!', 'success');
        }
    },

    totalItems() {
        return this.items.reduce((sum, i) => sum + i.quantity, 0);
    },

    totalPrice() {
        return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);
    },

    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        UI.updateCart();
    }
};

// ========================== UI MODULE ==========================
const UI = {
    cartCount: document.querySelector('.cart-count'),
    cartItems: document.getElementById('cart-items'),
    cartTotal: document.getElementById('cart-total'),
    cartOverlay: document.getElementById('cart-overlay'),
    clearBtn: document.getElementById('clear-cart'),

    updateCart() {
        this.cartCount.textContent = Cart.totalItems();
        this.cartTotal.textContent = `R$ ${Cart.totalPrice()}`;

        this.cartItems.innerHTML = '';

        if (Cart.items.length === 0) {
            this.cartItems.innerHTML = '<p class="empty-cart-message">Seu carrinho está vazio</p>';
            this.clearBtn.style.display = 'none';
            return;
        }

        this.clearBtn.style.display = 'block';

        Cart.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>R$ ${(item.price * item.quantity).toFixed(2)}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-id="${item.id}">&times;</button>
            `;
            this.cartItems.appendChild(div);
        });
    },

    notify(msg, type) {
        const note = document.createElement('div');
        note.className = `notification ${type}`;
        note.textContent = msg;
        document.body.appendChild(note);
        setTimeout(() => note.remove(), 3000);
    }
};

// ========================== PRODUCTS MODULE ==========================
const Products = {
    load() {
        const prods = JSON.parse(localStorage.getItem('produtos')) || [];
        prods.forEach(prod => {
            const section = document.querySelector(`[data-categoria="${prod.categoria}"] .produtos-grid`);
            if (section) {
                section.innerHTML += `
                    <div class="produto-card">
                        <img src="${prod.imagem}" alt="${prod.nome}">
                        <h3>${prod.nome}</h3>
                        <p>R$ ${prod.preco}</p>
                        <button class="add-to-cart" 
                                data-id="${prod.categoria}-${prod.codigo}" 
                                data-name="${prod.nome}" 
                                data-price="${prod.preco}" 
                                data-img="${prod.imagem}">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                `;
            }
        });
    }
};


//========================= FILTRO POR CATEGORIA ======================

const filtroPorCategoria = {

        btnActive : document.getElementsByClassName('active'),

        removerActive() {
            console.log(this.btnActive[0]);
            this.btnActive.classList.remove('active');
        },

        adicionarActive(e) { e.target.classList.add('active')},
}

// ========================== MAIN ==========================
document.addEventListener('DOMContentLoaded', () => {
    Products.load();
    UI.updateCart();

    // Eventos
    document.addEventListener('click', e => {
        const id = e.target.getAttribute('data-id');

        if (e.target.classList.contains('add-to-cart')) {
            Cart.add({
                id,
                name: e.target.getAttribute('data-name'),
                price: parseFloat(e.target.getAttribute('data-price').replace(',', '.')),
                img: e.target.getAttribute('data-img')
            });
            UI.notify('Adicionado ao carrinho!', 'success');
        }

        if (e.target.classList.contains('cart-item-remove')) {
            Cart.remove(id);
            UI.notify('Item removido!', 'info');
        }

        if (e.target.classList.contains('increase')) {
            Cart.adjustQuantity(id, 1);
        }

        if (e.target.classList.contains('decrease')) {
            Cart.adjustQuantity(id, -1);
        }
    });
    document.getElementById('filtroPorCategoria').addEventListener('click',() => filtroPorCategoria.removerActive());
    document.getElementById('filtroPorCategoria').addEventListener('click',(e) => filtroPorCategoria.adicionarActive(e))

    document.getElementById('open-cart').addEventListener('click', () => UI.cartOverlay.classList.add('active'));
    document.getElementById('close-cart').addEventListener('click', () => UI.cartOverlay.classList.remove('active'));

    UI.clearBtn.addEventListener('click', () => Cart.clear());
});