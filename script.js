// ========================== CART MODULE ==========================
// Módulo para gerenciar o carrinho de compras
const Cart = {
	items: JSON.parse(localStorage.getItem("cart")) || [],

	// Adiciona um produto ao carrinho
	add(product) {
		const existing = this.items.find((item) => item.id === product.id);
		if (existing) {
			existing.quantity++;
		} else {
			product.quantity = 1;
			this.items.push(product);
		}
		this.save();
	},

	// Remove um item do carrinho pelo ID
	remove(id) {
		this.items = this.items.filter((item) => item.id !== id);
		this.save();
	},

	// Ajusta a quantidade de um item no carrinho
	adjustQuantity(id, delta) {
		const item = this.items.find((i) => i.id === id);
		if (item) {
			item.quantity += delta;
			if (item.quantity <= 0) this.remove(id);
			else this.save();
		}
	},

	//Limpa o carrinho e exibe uma mensagem de confirmação
	clear() {
		if (confirm("Tem certeza que deseja limpar seu carrinho?")) {
			this.items = [];
			this.save();
			UI.notify("Carrinho limpo!", "success");
		}
	},

	// Retorna o número total de itens no carrinho
	totalItems() {
		return this.items.reduce((sum, i) => sum + i.quantity, 0);
	},

	// Retorna o preço total do carrinho formatado
	totalPrice() {
		return this.items
			.reduce((sum, i) => sum + i.price * i.quantity, 0)
			.toFixed(2);
	},

	// Salva o carrinho no localStorage e atualiza a interface
	save() {
		localStorage.setItem("cart", JSON.stringify(this.items));
		UI.updateCart();
	},
};

// ========================== UI MODULE ==========================
// Módulo para gerenciar a interface do usuário
const UI = {
	cartCount: document.querySelector(".cart-count"),
	cartItems: document.getElementById("cart-items"),
	cartTotal: document.getElementById("cart-total"),
	cartOverlay: document.getElementById("cart-overlay"),
	clearBtn: document.getElementById("clear-cart"),

	// Atualiza o carrinho na interface
	updateCart() {
		this.cartCount.textContent = Cart.totalItems();
		this.cartTotal.textContent = `R$ ${Cart.totalPrice()}`;

		this.cartItems.innerHTML = "";

		if (Cart.items.length === 0) {
			this.cartItems.innerHTML =
				'<p class="empty-cart-message">Seu carrinho está vazio</p>';
			this.clearBtn.style.display = "none";
			return;
		}

		this.clearBtn.style.display = "block";
		Cart.items.forEach((item) => {
			const div = document.createElement("div");
			div.className = "cart-item";
			div.innerHTML = `
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>R$ ${(item.price * item.quantity).toFixed(2)}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-id="${
													item.id
												}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${
													item.id
												}">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-id="${
									item.id
								}">&times;</button>
            `;
			this.cartItems.appendChild(div);
		});
	},

	// Exibe uma notificação na tela
	notify(msg, type) {
		const note = document.createElement("div");
		note.className = `notification ${type}`;
		note.textContent = msg;
		document.body.appendChild(note);
		setTimeout(() => note.remove(), 3000);
	},
};

// ========================== PRODUCTS MODULE ==========================
// Módulo para carregar e exibir produtos
const Products = {
	load() {
		// Verifica se já existem produtos no localStorage
		const prods = JSON.parse(localStorage.getItem("produtos")) || [];
		prods.forEach((prod) => {
			const section = document.querySelector(
				`[data-categoria="${prod.categoria}"] .produtos-grid`
			);

			// Se a seção não existir, cria uma nova
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
	},
};

//========================= FILTRO POR CATEGORIA ======================
// Módulo para filtrar produtos por categoria
const filtroPorCategoria = {
	btnActive: document.getElementsByClassName("active"),
	sectionCategoria: document.getElementsByClassName("categoria-produtos"),

	// Remove a classe "active" de todos os botões de filtro
	removerActive() {
		for (const btnRemove of this.btnActive) {
			btnRemove.classList.remove("active");
		}
	},

	// Adiciona a classe "active" ao botão clicado e filtra as seções de produtos
	adicionarActive(e) {
		e.target.classList.add("active");
		const dataCategoriaFiltro = e.target.getAttribute("data-categoria");

		for (const sectionCategoriaArray of this.sectionCategoria) {
			if (
				sectionCategoriaArray.getAttribute("data-categoria") ===
					dataCategoriaFiltro ||
				"todos" === dataCategoriaFiltro
			) {
				sectionCategoriaArray.style.display = "block";
			} else {
				sectionCategoriaArray.style.display = "none";
			}
		}
	},
};

// ========================== MAIN ==========================
// Inicializa o carrinho e a interface quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
	Products.load();
	UI.updateCart();

	// Eventos
	document.addEventListener("click", (e) => {
		const id = e.target.getAttribute("data-id");

		if (e.target.classList.contains("add-to-cart")) {
			Cart.add({
				id,
				name: e.target.getAttribute("data-name"),
				price: parseFloat(
					e.target.getAttribute("data-price").replace(",", ".")
				),
				img: e.target.getAttribute("data-img"),
			});
			UI.notify("Adicionado ao carrinho!", "success");
		}

		if (e.target.classList.contains("cart-item-remove")) {
			Cart.remove(id);
			UI.notify("Item removido!", "info");
		}

		if (e.target.classList.contains("increase")) {
			Cart.adjustQuantity(id, 1);
		}

		if (e.target.classList.contains("decrease")) {
			Cart.adjustQuantity(id, -1);
		}
	});

	document.getElementById("checkout-btn").addEventListener("click", () => {

		// Captura os dados do cliente
		const nome = document.getElementById("cliente-nome").value.trim();
		const endereco = document.getElementById("cliente-endereco").value.trim();
		const telefone = document.getElementById("cliente-telefone").value.trim();
		const observacoes = document
			.getElementById("cliente-observacoes")
			.value.trim();

		// Valida os dados do cliente
		if (!nome || !endereco || !telefone) {
			alert("Por favor, preencha nome, endereço e telefone.");
			return;
		}
		// Valida o telefone
		if (Cart.items.length === 0) {
			alert("Seu carrinho está vazio.");
			return;
		}

		// Monta a mensagem para o WhatsApp
		let mensagem = `📦 *Pedido via site*\n\n`;
		mensagem += `👤 *Nome:* ${nome}\n`;
		mensagem += `🏠 *Endereço:* ${endereco}\n`;
		mensagem += `📱 *WhatsApp:* ${telefone}\n`;
		mensagem += `📝 *Observações:* ${observacoes || "Nenhuma"}\n\n`;
		mensagem += `🛒 *Itens do Pedido:*\n`;

		// Lista os itens do carrinho
		Cart.items.forEach((item, index) => {
			const subtotal = (item.price * item.quantity)
				.toFixed(2)
				.replace(".", ",");
			mensagem += `\n${index + 1}. ${item.name} (ID: ${item.id})\nQtd: ${
				item.quantity
			} - R$ ${subtotal}`;
		});

		const total = parseFloat(Cart.totalPrice()).toFixed(2).replace(".", ",");
		mensagem += `\n\n💰 *Total:* R$ ${total}`;

		// Número da loja - ajuste aqui com o seu número real
		const numeroLoja = "5521988304627"; // Exemplo com DDI + DDD + número
		const url = `https://wa.me/${numeroLoja}?text=${encodeURIComponent(
			mensagem
		)}`;

		window.open(url, "_blank");
	});

	// Filtro por categoria
	document
		.getElementById("filtroPorCategoria")
		.addEventListener("click", () => filtroPorCategoria.removerActive());
	document
		.getElementById("filtroPorCategoria")
		.addEventListener("click", (e) => filtroPorCategoria.adicionarActive(e));

	// Eventos do carrinho
	document
		.getElementById("open-cart")
		.addEventListener("click", () => UI.cartOverlay.classList.add("active"));
	document
		.getElementById("close-cart")
		.addEventListener("click", () => UI.cartOverlay.classList.remove("active"));

	UI.clearBtn.addEventListener("click", () => Cart.clear());
});

