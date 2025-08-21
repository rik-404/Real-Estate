// Script para gerenciar o comportamento da navbar em todas as páginas

document.addEventListener("DOMContentLoaded", () => {
  // Função para destacar o item de menu ativo com base na URL atual
  function highlightActiveMenuItem() {
    const currentPath = window.location.pathname
    const navLinks = document.querySelectorAll(".nav-links a")

    // Remove a classe 'active' de todos os links
    navLinks.forEach((link) => {
      link.classList.remove("active")
    })

    // Adiciona a classe 'active' ao link correspondente à página atual
    navLinks.forEach((link) => {
      const href = link.getAttribute("href")
      const linkPath = href.substring(href.lastIndexOf("/") + 1)

      if (currentPath.includes(linkPath) && linkPath !== "") {
        link.classList.add("active")
      } else if (currentPath.endsWith("/") || currentPath.endsWith("index.html")) {
        // Destaca "Home" na página inicial
        if (link.textContent.trim().toLowerCase() === "inicio") {
          link.classList.add("active")
        }
      }
    })
  }

  // Função para adicionar comportamento ao botão "Fale conosco"
  function setupContactButton() {
    const contactButton = document.querySelector(".contact-button button")
    if (contactButton) {
      contactButton.addEventListener("click", () => {
        // Determina o caminho correto para a página de contato com base na localização atual
        let contactPath = ""

        if (window.location.pathname.includes("/src/pages/")) {
          contactPath = "./contact.html"
        } else if (window.location.pathname.includes("/admin/")) {
          contactPath = "../src/pages/contact.html"
        } else {
          contactPath = "./src/pages/contact.html"
        }

        window.location.href = contactPath
      })
    }
  }

  // Executa as funções
  highlightActiveMenuItem()
  setupContactButton()
})
