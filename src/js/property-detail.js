document.addEventListener("DOMContentLoaded", () => {
  // Obter ID do imóvel da URL
  const urlParams = new URLSearchParams(window.location.search)
  const propertyId = urlParams.get("id")

  if (!propertyId) {
    // Redirecionar para a página de compra se não houver ID
    window.location.href = "./src/pages/buy.html"
    return
  }

  // Carregar detalhes do imóvel
  loadPropertyDetails(propertyId)

  function loadPropertyDetails(id) {
    const properties = JSON.parse(localStorage.getItem("properties") || "[]")
    const property = properties.find((p) => p.id === id)

    if (!property) {
      // Imóvel não encontrado
      document.getElementById("property-details-container").innerHTML = `
        <div class="property-not-found">
            <h2>Imóvel não encontrado</h2>
            <p>O imóvel que você está procurando não está disponível.</p>
            <a href="./src/pages/buy.html" class="admin-button">Ver outros imóveis</a>
        </div>
      `
      return
    }

    // Atualizar título da página
    document.title = `${property.title} - Elite House`

    // Renderizar detalhes do imóvel
    const detailsContainer = document.getElementById("property-details-container")

    detailsContainer.innerHTML = `
      <div class="property-details">
          <div class="property-image-container">
              <img src="${property.image}" alt="${property.title}" class="property-image">
          </div>
          <div class="property-info-container">
              <h1 class="property-title">${property.title}</h1>
              <p class="property-location">${property.location}</p>
              <p class="property-price">R$ ${Number(property.price).toLocaleString("pt-BR")}</p>
              
              <div class="property-features">
                  <div class="property-feature">
                      <i class="fa-solid fa-ruler-combined"></i>
                      <span>${property.area} m²</span>
                  </div>
                  <div class="property-feature">
                      <i class="fa-solid fa-bed"></i>
                      <span>${property.bedrooms} quartos</span>
                  </div>
                  <div class="property-feature">
                      <i class="fa-solid fa-toilet"></i>
                      <span>${property.bathrooms} banheiros</span>
                  </div>
                  <div class="property-feature">
                      <i class="fa-solid fa-car"></i>
                      <span>${property.garage} vagas</span>
                  </div>
              </div>
              
              <div class="property-description">
                  <h3>Descrição</h3>
                  <p>${property.description || "Sem descrição disponível."}</p>
              </div>
              
              <div class="property-contact">
                  <h3>Interessado? Entre em contato</h3>
                  <div class="contact-buttons">
                      <button class="contact-button whatsapp-button">
                          <i class="fa-brands fa-whatsapp"></i>
                          WhatsApp
                      </button>
                      <button class="contact-button call-button">
                          <i class="fa-solid fa-phone"></i>
                          Ligar
                      </button>
                      <button class="contact-button email-button">
                          <i class="fa-solid fa-envelope"></i>
                          Email
                      </button>
                  </div>
              </div>
          </div>
      </div>
      
      <div class="property-reference">
          <p>Referência: ${property.ref}</p>
      </div>
    `

    // Adicionar event listeners para botões de contato
    const whatsappButton = detailsContainer.querySelector(".whatsapp-button")
    const callButton = detailsContainer.querySelector(".call-button")
    const emailButton = detailsContainer.querySelector(".email-button")

    whatsappButton.addEventListener("click", () => {
      window.open(`https://wa.me/5519999999999?text=Olá, tenho interesse no imóvel ${property.ref} - ${property.title}`)
    })

    callButton.addEventListener("click", () => {
      window.location.href = "tel:+5519999999999"
    })

    emailButton.addEventListener("click", () => {
      window.location.href = `mailto:example@email.com?subject=Interesse no imóvel ${property.ref}&body=Olá, tenho interesse no imóvel ${property.ref} - ${property.title}`
    })
  }
})
