import EliteHouseUtils from "./utils.js"

document.addEventListener("DOMContentLoaded", () => {
  // Inicializar dados se não existirem
  const properties = EliteHouseUtils.storage.get("properties", [])

  // Registrar visualização da página
  incrementPageView()

  // Carregar imóveis em destaque
  loadFeaturedProperties()

  // Adicionar event listener para o botão "Ver Mais"
  const verMaisBtn = document.getElementById("ver-mais-btn")
  if (verMaisBtn) {
    verMaisBtn.addEventListener("click", () => {
      console.log("Botão Ver Mais clicado, redirecionando para a página de compra")
      window.location.href = "./src/pages/buy.html"
    })
  } else {
    console.warn("Botão Ver Mais não encontrado na página")
  }

  // Adicionar event listener para o botão "Fale conosco"
  const faleConoscoBtn = document.querySelector(".contact-button button")
  if (faleConoscoBtn) {
    faleConoscoBtn.addEventListener("click", () => {
      window.location.href = "./src/pages/contact.html"
    })
  }

  // Adicionar event listener para o botão de filtro na página inicial
  const filterButtonHome = document.getElementById("filter-button-home")
  if (filterButtonHome) {
    filterButtonHome.addEventListener("click", () => {
      // Obter valores dos filtros
      const type = document.getElementById("property-type-home").value
      const location = document.getElementById("property-location-home").value
      const minPrice = document.getElementById("min-price-home").value
      const maxPrice = document.getElementById("max-price-home").value

      // Construir URL com parâmetros de busca usando a função utilitária
      const url = EliteHouseUtils.url.buildUrl("./src/pages/buy.html", {
        type: type,
        location: location,
        minPrice: minPrice,
        maxPrice: maxPrice,
      })

      // Redirecionar para a página de compra com os filtros
      window.location.href = url
    })
  }

  // Funções auxiliares
  // Carregar imóveis em destaque e na listagem geral
  function loadFeaturedProperties() {
    // Carregar todos os imóveis disponíveis
    const allProperties = properties
    const container = document.querySelector(".container-card")

    // Limpar container se existir
    if (container) {
      container.innerHTML = ""

      // Se não houver imóveis, não fazer nada
      if (allProperties.length === 0) {
        container.innerHTML = "<p>Nenhum imóvel disponível no momento.</p>"
        return
      }

      // Exibir no máximo 4 imóveis (destacados ou não)
      const propertiesToShow = allProperties.slice(0, 4)

      propertiesToShow.forEach((property) => {
        // Usar a função utilitária para criar o elemento do card
        const propertyCard = EliteHouseUtils.dom.createElement("div", {
          class: "card",
          "data-id": property.id,
        })

        // Adicionar classe especial para imóveis em destaque
        if (property.featured) {
          propertyCard.classList.add("featured-property")
        }

        propertyCard.innerHTML = `
        <img src="${property.image}" alt="${property.title}">
        ${property.featured ? '<div class="featured-badge"><i class="fa-solid fa-star"></i> Destaque</div>' : ""}
        <div class="card-content">
            <h3>${property.type}</h3>
            <p>${property.location}</p>
            <br>
            <p><i class="fa-solid fa-ruler-combined"></i> ${property.area}m² | <i class="fa-solid fa-bed"></i> ${property.bedrooms} quartos | <br><i class="fa-solid fa-toilet"></i> ${property.bathrooms} banheiros | <i class="fa-solid fa-car"></i> ${property.garage} vagas</p>
            <br>
            <p class="price">R$ ${EliteHouseUtils.format.formatPrice(property.price)}</p>
            <br>
            <p class="code">${property.ref}</p>
        </div>
      `

        // Adicionar event listener para visualizar detalhes
        propertyCard.addEventListener("click", function () {
          const propertyId = this.getAttribute("data-id")
          viewPropertyDetails(propertyId)
        })

        container.appendChild(propertyCard)
      })
    }
  }

  function viewPropertyDetails(propertyId) {
    // Redirecionar para a página de detalhes do imóvel
    window.location.href = `property-detail.html?id=${propertyId}`
  }

  function incrementPageView() {
    // Usar a função utilitária para incrementar contador
    EliteHouseUtils.storage.increment("totalViews")

    // Incrementar usuários ativos (simulação)
    const activeUsers = Math.floor(Math.random() * 10) + 1
    localStorage.setItem("activeUsers", activeUsers.toString())
  }
})
