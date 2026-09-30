document.addEventListener('DOMContentLoaded', () => {
  // ===== Configuração do Google Forms =====
  const FORM_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLSd_h4EsQs6wvhVHmns-CYfKfuPbf7lNbt69yXER5pNRlSP4ig/formResponse';

  const ENTRY = {
    name: 'entry.2122466361',        // Nome
    phone: 'entry.427793748',        // WhatsApp
    service: 'entry.1502864410',     // Serviço
    message: 'entry.631565833',      // Observação
    dateBase: 'entry.1614421179',    // Data (_year, _month, _day)
    timeBase: 'entry.1892370718'     // Horário (_hour, _minute)
  };

  // ===== Menu mobile =====
  const menuButton = document.getElementById('menuButton');
  const navigation = document.getElementById('navigation');

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';

      menuButton.setAttribute('aria-expanded', String(!isOpen));
      navigation.classList.toggle('active', !isOpen);
      navigation.classList.toggle('show', !isOpen);
    });

    navigation.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        navigation.classList.remove('active', 'show');
      });
    });
  }

  // ===== Filtro de serviços =====
  const filterButtons = document.querySelectorAll('.filter-button');
  const serviceCards = document.querySelectorAll('.service-card');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => item.classList.toggle('active', item === button));

      serviceCards.forEach((card) => {
        const matches = filter === 'todos' || card.dataset.category === filter;
        card.hidden = !matches;
        card.classList.toggle('hidden', !matches);
      });
    });
  });

  // ===== FAQ =====
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');

    if (!question) return;

    question.addEventListener('click', () => {
      const alreadyOpen = item.classList.contains('active');

      faqItems.forEach((faq) => {
        faq.classList.remove('active');
        const answer = faq.querySelector('.faq-answer');
        if (answer) answer.style.display = 'none';
      });

      if (!alreadyOpen) {
        item.classList.add('active');
        const answer = item.querySelector('.faq-answer');
        if (answer) answer.style.display = 'block';
      }
    });
  });

  // ===== Data mínima (hoje) =====
  const dateInput = document.getElementById('date');

  if (dateInput) {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60 * 1000);
    dateInput.min = localDate.toISOString().split('T')[0];
  }

  // ===== Modal de sucesso =====
  const bookingForm = document.getElementById('bookingForm');
  const successModal = document.getElementById('successModal');
  const modalClose = document.getElementById('modalClose');
  const modalOk = document.getElementById('modalOk');

  const closeModal = () => {
    if (successModal) {
      successModal.classList.remove('active');
      successModal.setAttribute('aria-hidden', 'true');
    }
  };

  const openModal = () => {
    if (successModal) {
      successModal.classList.add('active');
      successModal.setAttribute('aria-hidden', 'false');
    }
  };

  modalClose?.addEventListener('click', closeModal);
  modalOk?.addEventListener('click', closeModal);

  successModal?.addEventListener('click', (event) => {
    if (event.target === successModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && successModal && successModal.classList.contains('active')) {
      closeModal();
    }
  });

  // ===== Agendamento -> Google Forms =====
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('name')?.value.trim();
      const phone = document.getElementById('phone')?.value.trim();
      const service = document.getElementById('service')?.value.trim();
      const date = document.getElementById('date')?.value.trim();
      const time = document.getElementById('time')?.value.trim();
      const message = document.getElementById('message')?.value.trim() || '';

      if (!name || !phone || !service || !date || !time) {
        alert('Preencha todos os campos obrigatórios antes de enviar.');
        return;
      }

      const [year, month, day] = date.split('-');
      const [hour, minute] = time.split(':');

      const data = new FormData();
      data.append(ENTRY.name, name);
      data.append(ENTRY.phone, phone);
      data.append(ENTRY.service, service);
      data.append(ENTRY.message, message);

      data.append(`${ENTRY.dateBase}_year`, year);
      data.append(`${ENTRY.dateBase}_month`, parseInt(month, 10));
      data.append(`${ENTRY.dateBase}_day`, parseInt(day, 10));

      data.append(`${ENTRY.timeBase}_hour`, parseInt(hour, 10));
      data.append(`${ENTRY.timeBase}_minute`, parseInt(minute, 10));

      const submitButton = bookingForm.querySelector('button[type="submit"]');
      const originalText = submitButton ? submitButton.textContent : '';

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
      }

      try {
        // no-cors: o Google não devolve resposta legível, mas o envio funciona
        await fetch(FORM_URL, { method: 'POST', mode: 'no-cors', body: data });
        bookingForm.reset();
        openModal();
      } catch (error) {
        alert('Não foi possível enviar sua solicitação. Tente novamente em instantes.');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      }
    });
  }
});