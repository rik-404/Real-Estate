document.addEventListener("DOMContentLoaded", () => {
  // Verificar se estamos na página de contato
  const contactForm = document.getElementById("contact-form")
  if (!contactForm) return

  // Adicionar event listener para o formulário de contato
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Obter os valores do formulário
    const name = document.getElementById("contact-name").value
    const email = document.getElementById("contact-email").value
    const phone = document.getElementById("contact-phone").value
    const message = document.getElementById("contact-message").value

    // Validar os campos obrigatórios
    if (!name || !email || !phone) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    // Gerar ID único para o cliente
    const clientId = "client_" + Date.now()

    // Criar objeto de cliente pendente
    const newClient = {
      id: clientId,
      name: name,
      email: email,
      phone: phone,
      notes: message,
      isPending: true, // Marcar como cliente pendente
      contactDate: new Date().toISOString(), // Adicionar data de contato
      status: "Novo",
    }

    // Obter clientes existentes do localStorage
    const clients = JSON.parse(localStorage.getItem("clients") || "[]")

    // Adicionar o novo cliente
    clients.push(newClient)

    // Salvar no localStorage
    localStorage.setItem("clients", JSON.stringify(clients))

    // Limpar o formulário
    contactForm.reset()

    // Mostrar mensagem de sucesso
    alert("Sua mensagem foi enviada com sucesso! Em breve um de nossos corretores entrará em contato.")
  })
})
