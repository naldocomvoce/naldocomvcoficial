document.addEventListener('DOMContentLoaded', function() {
    // Variáveis globais
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.querySelector('.cart-count');
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart');
    const categoriaBtns = document.querySelectorAll('.categoria-btn');
    const categoriasProdutos = document.querySelectorAll('.categoria-produtos');
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    const scrollToOfertasBtn = document.getElementById('scroll-to-ofertas');
    
    // Inicializar contador de ofertas
    initializeOfertasCounter();
    
    // Event Listeners
    openCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    checkoutBtn.addEventListener('click', finalizarPedidoWhatsApp);
    clearCartBtn.addEventListener('click', clearCart);
    
    // Filtro de categorias
    categoriaBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const categoria = btn.getAttribute('data-categoria');
            filterProducts(categoria);
            
            // Atualizar botões ativos
            categoriaBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Scroll para seção se não for "Todos"
            if (categoria !== 'todos') {
                const section = document.querySelector(`[data-categoria="${categoria}"]`);
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Adicionar ao carrinho
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = parseFloat(btn.getAttribute('data-price'));
            const img = btn.getAttribute('data-img');
            
            addToCart(id, name, price, img);
            
            // Feedback visual
            btn.textContent = 'Adicionado!';
            btn.style.backgroundColor = '#25D366';
            setTimeout(() => {
                btn.textContent = 'Adicionar ao Carrinho';
                btn.style.backgroundColor = '#333';
            }, 1000);
        });
    });
    
    // Scroll para ofertas
    if (scrollToOfertasBtn) {
        scrollToOfertasBtn.addEventListener('click', () => {
            const ofertasSection = document.querySelector('.oferta-especial');
            ofertasSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Atualizar carrinho ao carregar a página
    updateCart();
    
    // Funções
    function filterProducts(categoria) {
        if (categoria === 'todos') {
            categoriasProdutos.forEach(section => {
                section.style.display = 'block';
            });
        } else {
            categoriasProdutos.forEach(section => {
                if (section.getAttribute('data-categoria') === categoria) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        }
    }
    
    function addToCart(id, name, price, img) {
        // Verificar se o item já está no carrinho
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id,
                name,
                price,
                img,
                quantity: 1
            });
        }
        
        saveCartToLocalStorage();
        updateCart();
        openCart();
    }
    
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        saveCartToLocalStorage();
        updateCart();
    }
    
    function adjustQuantity(id, change) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            
            // Remover item se quantidade for zero ou menos
            if (item.quantity <= 0) {
                removeFromCart(id);
            } else {
                saveCartToLocalStorage();
                updateCart();
            }
        }
    }
    
    function clearCart() {
        if (cart.length === 0) return;
        
        if (confirm('Tem certeza que deseja limpar seu carrinho?')) {
            cart = [];
            saveCartToLocalStorage();
            updateCart();
            showNotification('Carrinho limpo com sucesso!', 'success');
        }
    }
    
    function updateCart() {
        // Atualizar contador
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Atualizar lista de itens
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart-message">Seu carrinho está vazio</p>';
            clearCartBtn.style.display = 'none';
        } else {
            cartItems.innerHTML = '';
            clearCartBtn.style.display = 'block';
            
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <p class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn increase" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}">&times;</button>
                `;
                cartItems.appendChild(cartItem);
            });
            
            // Adicionar event listeners
            document.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    removeFromCart(btn.getAttribute('data-id'));
                });
            });
            
            document.querySelectorAll('.decrease').forEach(btn => {
                btn.addEventListener('click', () => {
                    adjustQuantity(btn.getAttribute('data-id'), -1);
                });
            });
            
            document.querySelectorAll('.increase').forEach(btn => {
                btn.addEventListener('click', () => {
                    adjustQuantity(btn.getAttribute('data-id'), 1);
                });
            });
        }
        
        // Atualizar total
        updateCartTotal();
    }
    
    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `R$ ${total.toFixed(2)}`;
    }
    
    function openCart() {
        cartOverlay.classList.add('active');
    }
    
    function closeCart() {
        cartOverlay.classList.remove('active');
    }
    
    function finalizarPedidoWhatsApp() {
        if (cart.length === 0) {
            showNotification('Seu carrinho está vazio!', 'error');
            return;
        }
        
        const nome = document.getElementById('cliente-nome').value;
        const endereco = document.getElementById('cliente-endereco').value;
        const telefone = document.getElementById('cliente-telefone').value;
        const observacoes = document.getElementById('cliente-observacoes').value;
        
        // Validar campos obrigatórios
        if (!nome || !endereco || !telefone) {
            showNotification('Por favor, preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        // Formatar mensagem
        let mensagem = `*Pedido via Naldo.comvocê*%0A%0A`;
        mensagem += `*Nome:* ${nome}%0A`;
        mensagem += `*Endereço:* ${endereco}%0A`;
        mensagem += `*WhatsApp:* ${telefone}%0A`;
        
        if (observacoes) {
            mensagem += `*Observações:* ${observacoes}%0A%0A`;
        } else {
            mensagem += `%0A`;
        }
        
        mensagem += `*Itens do Pedido:*%0A%0A`;
        
        cart.forEach(item => {
            mensagem += `➡ ${item.name}%0A`;
            mensagem += `💰 R$ ${item.price.toFixed(2)} × ${item.quantity} = R$ ${(item.price * item.quantity).toFixed(2)}%0A%0A`;
        });
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        mensagem += `*Total: R$ ${total.toFixed(2)}*%0A%0A`;
        mensagem += `Obrigado pelo seu pedido!`;
        
        // Abrir WhatsApp
        window.open(`https://wa.me/5521988304627?text=${mensagem}`, '_blank');
        
        // Limpar carrinho após finalização
        cart = [];
        saveCartToLocalStorage();
        updateCart();
        document.getElementById('cliente-nome').value = '';
        document.getElementById('cliente-endereco').value = '';
        document.getElementById('cliente-telefone').value = '';
        document.getElementById('cliente-observacoes').value = '';
        
        showNotification('Pedido enviado com sucesso!', 'success');
    }
    
    function initializeOfertasCounter() {
        const contadorTempo = document.getElementById('contador-tempo');
        
        if (contadorTempo) {
            let horas = 24;
            let minutos = 59;
            let segundos = 59;
            
            setInterval(() => {
                segundos--;
                
                if (segundos < 0) {
                    segundos = 59;
                    minutos--;
                }
                
                if (minutos < 0) {
                    minutos = 59;
                    horas--;
                }
                
                if (horas < 0) {
                    horas = 0;
                    minutos = 0;
                    segundos = 0;
                }
                
                contadorTempo.textContent = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
            }, 1000);
        }
    }
    
    function saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }
    
    // Mostrar categoria "Todos" por padrão
    filterProducts('todos');
});

function filterProducts(categoria) {
    const ofertaEspecial = document.getElementById('oferta-especial');
    
    if (categoria === 'todos') {
        // Mostrar todos os produtos e a oferta especial
        categoriasProdutos.forEach(section => {
            section.style.display = 'block';
        });
        ofertaEspecial.style.display = 'block';
    } else {
        // Esconder a oferta especial e mostrar apenas a categoria selecionada
        ofertaEspecial.style.display = 'none';
        categoriasProdutos.forEach(section => {
            if (section.getAttribute('data-categoria') === categoria) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    }
}


document.addEventListener('DOMContentLoaded', function() {

    
   
    filterProducts('todos');
    
    
    const ofertaEspecial = document.getElementById('oferta-especial');
    ofertaEspecial.style.display = 'block';
});