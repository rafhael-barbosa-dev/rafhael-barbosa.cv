// IMPORTANTE: Cole aqui a URL completa da implantação do seu Google Apps Script.
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwJvnn2ylx-yGZVG3yK6-20li5Jy6wTT3ITpVd_1fzwKPI6kbNfY57upZIzO4JSPiHpnA/exec";

// --- LÓGICA DA PÁGINA INICIAL (index.html) ---
if (document.getElementById('lerMaisBtn')) {
    // A lógica desta página não precisa de alterações.
    const lerMaisBtn = document.getElementById('lerMaisBtn');
    const emailModal = document.getElementById('emailModal');
    const emailForm = document.getElementById('emailForm');
    lerMaisBtn.addEventListener('click', () => emailModal.classList.add('visible'));
    emailForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('#emailInput').value;
        const button = e.target.querySelector('button');
        if (email) {
            button.textContent = 'Aguarde...';
            const url = new URL(SCRIPT_URL);
            url.searchParams.append('action', 'newUser');
            url.searchParams.append('email', email);
            fetch(url).then(res => res.json()).then(result => {
                if(result.result === 'success') {
                    localStorage.setItem('userEmail', email);
                    window.location.href = 'perfil.html';
                } else { throw new Error(result.message); }
            }).catch(error => {
                alert('Ocorreu um erro: ' + error.message);
                button.textContent = 'Acessar Conteúdo';
            });
        }
    });
}

// --- LÓGICA DA PÁGINA DE PERFIL (perfil.html) ---
if (document.getElementById('radarChart')) {
    // Proteção da página
    if (!localStorage.getItem('userEmail')) {
        window.location.href = 'index.html';
    }

    let chartData = []; 
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    const legendContainer = document.getElementById('chartLegend');
    const experienceBox = document.querySelector('#experienceBox p');
    const commentBox = document.querySelector('#commentBox p');

    // Carrega dados da planilha e renderiza tudo
    function loadAndRenderCharts() {
        const dataUrl = `${SCRIPT_URL}?action=getData`;
        fetch(dataUrl).then(res => res.json()).then(data => {
            if (data.error || !data.bancoDeDados) {
                throw new Error(data.message || 'A resposta do script está inválida.');
            }
            chartData = data.bancoDeDados.slice(1);
            renderRadarChart(chartData);
            renderBarChart(chartData);
            generateInteractiveLegend(chartData);
            preloader.style.opacity = '0';
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
            setTimeout(() => { preloader.style.display = 'none'; }, 500);
        }).catch(error => {
            console.error("ERRO CRÍTICO AO BUSCAR DADOS:", error);
            preloader.innerHTML = `<div class="loader-text">Falha ao carregar: ${error.message}</div>`;
        });
    }

    // Gera a legenda interativa
    function generateInteractiveLegend(data) {
        const labels = data.map(row => row[0]);
        labels.forEach((label, index) => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.textContent = label;
            item.addEventListener('click', () => {
                displayDetails(index);
                document.querySelectorAll('.legend-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
            });
            legendContainer.appendChild(item);
        });
    }
    
    // Mostra os detalhes ao clicar na legenda
    function displayDetails(index) {
        experienceBox.innerHTML = chartData[index][2].replace(/\n/g, '<br>'); // Preserva quebras de linha
        commentBox.textContent = chartData[index][3];
    }

    // Função para renderizar o gráfico de radar (com textos restaurados)
function renderRadarChart(data) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    const labels = data.map(row => row[0]);
    const values = data.map(row => row[1]);
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Autoavaliação',
                data: values,
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                borderColor: 'rgb(220, 38, 38)',
                borderWidth: 2,
                pointBackgroundColor: 'hsla(0, 72%, 51%, 1.00)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(220, 38, 38)'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                r: {
                    angleLines: { color: 'rgba(225, 225, 230, 0.2)' },
                    grid: { color: 'rgba(225, 225, 230, 0.2)' },
                    pointLabels: { color: '#E1E1E6', font: { size: 12 } },
                    ticks: {
                        // ADICIONADO AQUI PARA REMOVER OS NÚMEROS
                        display: false,
                        backdropColor: '#202024',
                        color: '#E1E1E6'
                    },
                    min: 0, max: 10
                }
            }
        }
    });
}
    
    // Função para renderizar o gráfico de barras (com textos restaurados e barras largas)
function renderBarChart(data) {
    const ctx = document.getElementById('barChart').getContext('2d');
    const labels = data.map(row => row[0]);
    const values = data.map(row => row[1]);
    const barColors = ['#DC2626', '#16A34A', '#D97706', '#DB2777', '#CA8A04', '#9333EA', '#6D28D9'];
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: barColors,
                // REMOVIDO: barPercentage e categoryPercentage
                // ADICIONADO: barThickness para forçar a largura das barras
                barThickness: 30, // Largura de 30 pixels por barra
            }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    beginAtZero: true, max: 10,
                    grid: { color: 'rgba(225, 225, 230, 0.1)' },
                    ticks: { color: '#E1E1E6' }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#E1E1E6' }
                }
            }
        }
    });
}

    loadAndRenderCharts();

// --- LÓGICA DO SISTEMA DE FEEDBACK ---
const stars = document.querySelectorAll('.star');
const commentInput = document.getElementById('commentInput');
const sendCommentBtn = document.getElementById('sendCommentBtn');
const feedbackModal = document.getElementById('feedbackModal');
const closeFeedbackModalBtn = document.getElementById('closeFeedbackModalBtn');
let currentRating = 0;

// Lógica das estrelas (hover e click)
stars.forEach(star => {
    star.addEventListener('mouseover', () => {
        const hoverValue = parseInt(star.dataset.value);
        stars.forEach(s => s.classList.toggle('hover', parseInt(s.dataset.value) <= hoverValue));
    });
    star.addEventListener('mouseout', () => stars.forEach(s => s.classList.remove('hover')));
    star.addEventListener('click', () => {
        currentRating = parseInt(star.dataset.value);
        stars.forEach(s => s.classList.toggle('selected', parseInt(s.dataset.value) <= currentRating));
    });
});

// Lógica de envio do comentário para a planilha
sendCommentBtn.addEventListener('click', () => {
    const comment = commentInput.value.trim();
    const rating = currentRating;
    if (comment === "" && rating === 0) {
        alert("Por favor, deixe um comentário ou uma avaliação.");
        return;
    }
    sendCommentBtn.textContent = "Enviando...";
    sendCommentBtn.disabled = true;

    const url = new URL(SCRIPT_URL);
    url.searchParams.append('action', 'newFeedback');
    url.searchParams.append('email', localStorage.getItem('userEmail'));
    url.searchParams.append('rating', rating);
    url.searchParams.append('comment', comment);

    fetch(url).then(res => res.json()).then(result => {
        if (result.result === 'success') {
            feedbackModal.style.display = 'flex'; // Mostra o pop-up
        } else { throw new Error(result.message); }
    }).catch(error => {
        console.error("Erro ao enviar feedback:", error);
        alert("Ocorreu um erro ao enviar seu feedback. Tente novamente.");
        sendCommentBtn.textContent = "Enviar Comentário";
        sendCommentBtn.disabled = false; // Reabilita o botão em caso de erro
    });
});

// --- LÓGICA PARA FECHAR O POP-UP (VERSÃO FINAL) ---

// 1. Função central para esconder o pop-up e atualizar o botão
function hideFeedbackModal() {
    feedbackModal.style.display = 'none';
    sendCommentBtn.textContent = 'Enviado'; // Mudar o texto do botão
    // A propriedade 'disabled' já foi definida como 'true' ao clicar,
    // e como não a reativamos no caminho de sucesso, ela permanecerá desativada.
}

// 2. Fechar clicando no botão "Fechar"
closeFeedbackModalBtn.addEventListener('click', hideFeedbackModal);

// 3. Fechar clicando fora da caixa do pop-up
feedbackModal.addEventListener('click', (event) => {
    if (event.target === feedbackModal) {
        hideFeedbackModal();
    }
});

// 4. Fechar pressionando a tecla "Escape"
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && feedbackModal.style.display === 'flex') {
        hideFeedbackModal();
    }
});

    // AJUSTE 4: Correção do Bug das Estrelas
    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const hoverValue = parseInt(star.dataset.value);
            stars.forEach(s => s.classList.toggle('hover', parseInt(s.dataset.value) <= hoverValue));
        });
        star.addEventListener('mouseout', () => stars.forEach(s => s.classList.remove('hover')));
        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.value);
            stars.forEach(s => s.classList.toggle('selected', parseInt(s.dataset.value) <= currentRating));
        });
    });

    sendCommentBtn.addEventListener('click', () => {
    const comment = commentInput.value.trim();
    const rating = currentRating;
    if (comment === "" && rating === 0) {
        alert("Por favor, deixe um comentário ou uma avaliação.");
        return;
    }
    sendCommentBtn.textContent = "Enviando...";
    sendCommentBtn.disabled = true;

    const url = new URL(SCRIPT_URL);
    url.searchParams.append('action', 'newFeedback');
    url.searchParams.append('email', localStorage.getItem('userEmail'));
    url.searchParams.append('rating', rating);
    // A LINHA ABAIXO FOI CORRIGIDA
    url.searchParams.append('comment', comment);

    fetch(url).then(res => res.json()).then(result => {
        if (result.result === 'success') {
            feedbackModal.style.display = 'flex';
        } else { throw new Error(result.message); }
    }).catch(error => {
        console.error("Erro ao enviar feedback:", error);
        alert("Ocorreu um erro ao enviar seu feedback. Tente novamente.");
        sendCommentBtn.textContent = "Enviar Comentário";
        sendCommentBtn.disabled = false;
    });
});
}