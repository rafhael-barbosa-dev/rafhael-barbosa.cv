// IMPORTANTE: Cole aqui a URL completa da implantação do seu Google Apps Script.
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxN-0sMD168gFdNVq-a8KYIKjeX5Sn22UHnnXQ88MKOCycd2Wrglz43ra0ySXvRZzChg/exec";

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
if (document.getElementById('main-content')) {
    // Proteção da página
    if (!localStorage.getItem('userEmail')) {
        window.location.href = 'index.html';
    }

    let chartData = [];
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    
    // Elementos para o dropdown de habilidades
    const dropdownButton = document.getElementById('dropdown-button');
    const dropdownList = document.getElementById('dropdown-list');
    const experienceBox = document.querySelector('#experienceBox p');
    const commentBox = document.querySelector('#commentBox p');

    // Carrega dados da planilha e renderiza tudo
    function loadAndRenderContent() {
        const dataUrl = `${SCRIPT_URL}?action=getData`;
        fetch(dataUrl).then(res => res.json()).then(data => {
            if (data.error || !data.bancoDeDados || !data.viaCharacter) {
                throw new Error(data.message || 'A resposta do script está inválida.');
            }
            chartData = data.bancoDeDados.slice(1);

            renderRadarChart(chartData);
            renderBarChart(chartData);
            
            setupInteractiveDropdown(chartData); 

            renderViaCharacterCards(data.viaCharacter.slice(1));

            preloader.style.opacity = '0';
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
            setTimeout(() => { preloader.style.display = 'none'; }, 500);
        }).catch(error => {
            console.error("ERRO CRÍTICO AO BUSCAR DADOS:", error);
            preloader.innerHTML = `<div class="loader-text">Falha ao carregar: ${error.message}</div>`;
        });
    }

    // Função para o dropdown de habilidades (sem alterações)
    function setupInteractiveDropdown(data) {
        if (!dropdownButton || !dropdownList) return;
        const labels = data.map(row => row[0]);
        dropdownList.innerHTML = '';
        labels.forEach((label, index) => {
            const item = document.createElement('li');
            item.textContent = label;
            item.addEventListener('click', () => {
                displayDetails(index);
                dropdownButton.textContent = label;
                dropdownList.classList.remove('visible');
            });
            dropdownList.appendChild(item);
        });
        dropdownButton.addEventListener('click', (event) => {
            event.stopPropagation();
            dropdownList.classList.toggle('visible');
        });
        window.addEventListener('click', () => {
            if (dropdownList.classList.contains('visible')) {
                dropdownList.classList.remove('visible');
            }
        });
    }

    // Mostra os detalhes da habilidade selecionada
    function displayDetails(index) {
        experienceBox.innerHTML = chartData[index][2].replace(/\n/g, '<br>');
        commentBox.textContent = chartData[index][3];
    }

    // Funções dos Gráficos (sem alterações)
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
                scales: { r: { angleLines: { color: 'rgba(225, 225, 230, 0.2)' }, grid: { color: 'rgba(225, 225, 230, 0.2)' }, pointLabels: { color: '#E1E1E6', font: { size: 12 } }, ticks: { display: false, backdropColor: '#202024', color: '#E1E1E6' }, min: 0, max: 10 } }
            }
        });
    }
    // Substitua a função inteira no seu arquivo script.js

// Substitua a função inteira no seu arquivo script.js

function renderBarChart(data) {
    const chartWrapper = document.getElementById('bar-chart-wrapper');
    const canvas = document.getElementById('barChart');
    if (!chartWrapper || !canvas) return;

    const numberOfBars = data.length;
    const heightPerBar = 50; 
    const minHeight = 250; 
    const calculatedHeight = numberOfBars * heightPerBar;

    chartWrapper.style.height = `${Math.max(calculatedHeight, minHeight)}px`;

    // A CORREÇÃO ESTÁ AQUI: '2d' em vez de 'd'
    const ctx = canvas.getContext('2d'); 

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
                barThickness: 30,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 10,
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

    // --- FUNÇÃO VIA CHARACTER ATUALIZADA PARA A CAIXA DE TEXTO ÚNICA ---
    function renderViaCharacterCards(data) {
        const container = document.getElementById('via-character-row');
        const descriptionBox = document.querySelector('#via-character-description-box p');
        if (!container || !descriptionBox) return;

        container.innerHTML = ''; // Limpa antes de adicionar

        data.forEach(row => {
            const priority = parseInt(row[0]);
            const characteristic = row[1];
            const description = row[2];

            const card = document.createElement('div');
            card.className = 'via-character-card';
            const iconClass = getIconForCharacteristic(characteristic);

            // Card simplificado, sem descrição ou seta
            card.innerHTML = `
                <i class="fa-solid ${iconClass}"></i>
                <h4>${priority}º ${characteristic}</h4>
            `;

            // Função que atualiza a caixa de texto e o card ativo
            const updateDetails = () => {
                descriptionBox.textContent = description;
                document.querySelectorAll('.via-character-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            };

            // Adiciona os eventos
            card.addEventListener('mouseover', updateDetails);
            card.addEventListener('click', updateDetails);

            if (priority <= 5) {
                card.classList.add(`priority-${priority}`);
            } else {
                // Lógica de cores (sem alteração)
                const totalSteps = 24 - 5;
                const currentStep = priority - 5;
                const startColor = { r: 220, g: 38, b: 38 };
                const endColor = { r: 50, g: 50, b: 56 };
                const r = Math.round(startColor.r + (endColor.r - startColor.r) * (currentStep / totalSteps));
                const g = Math.round(startColor.g + (endColor.g - startColor.g) * (currentStep / totalSteps));
                const b = Math.round(startColor.b + (endColor.b - startColor.b) * (currentStep / totalSteps));
                card.style.borderColor = `rgb(${r}, ${g}, ${b})`;
                card.querySelector('i').style.color = `rgb(${r}, ${g}, ${b})`;
            }
            container.appendChild(card);
        });
    }

    // Função auxiliar para escolher ícones (sem alterações)
    function getIconForCharacteristic(characteristic) {
        const lowerCaseChar = characteristic.toLowerCase();
        if (lowerCaseChar.includes('amor')) return 'fa-heart';
        if (lowerCaseChar.includes('aprendizagem')) return 'fa-book-open';
        if (lowerCaseChar.includes('curiosidade')) return 'fa-magnifying-glass';
        if (lowerCaseChar.includes('criatividade')) return 'fa-lightbulb';
        if (lowerCaseChar.includes('perspectiva')) return 'fa-mountain-sun';
        if (lowerCaseChar.includes('bravura')) return 'fa-shield-halved';
        if (lowerCaseChar.includes('perseverança') || lowerCaseChar.includes('diligência')) return 'fa-person-digging';
        if (lowerCaseChar.includes('honestidade')) return 'fa-check-double';
        if (lowerCaseChar.includes('entusiasmo')) return 'fa-bolt';
        if (lowerCaseChar.includes('bondade')) return 'fa-hand-holding-heart';
        if (lowerCaseChar.includes('inteligência social')) return 'fa-users';
        if (lowerCaseChar.includes('trabalho em equipe')) return 'fa-people-group';
        if (lowerCaseChar.includes('justiça')) return 'fa-scale-balanced';
        if (lowerCaseChar.includes('liderança')) return 'fa-crown';
        if (lowerCaseChar.includes('perdão')) return 'fa-dove';
        if (lowerCaseChar.includes('humildade')) return 'fa-leaf';
        if (lowerCaseChar.includes('prudência')) return 'fa-circle-check';
        if (lowerCaseChar.includes('autocontrole')) return 'fa-hand';
        if (lowerCaseChar.includes('belo') || lowerCaseChar.includes('excelência')) return 'fa-gem';
        if (lowerCaseChar.includes('gratidão')) return 'fa-seedling';
        if (lowerCaseChar.includes('esperança')) return 'fa-star';
        if (lowerCaseChar.includes('humor')) return 'fa-face-laugh-beam';
        if (lowerCaseChar.includes('espiritualidade')) return 'fa-om';
        return 'fa-question-circle'; // Ícone padrão
    }

    loadAndRenderContent();

    // --- LÓGICA DO SISTEMA DE FEEDBACK ---
const stars = document.querySelectorAll('.star');
const commentInput = document.getElementById('commentInput');
const sendCommentBtn = document.getElementById('sendCommentBtn');
const feedbackModal = document.getElementById('feedbackModal');
const closeFeedbackModalBtn = document.getElementById('closeFeedbackModalBtn');
let currentRating = 0;

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
function hideFeedbackModal() {
    feedbackModal.style.display = 'none';
    sendCommentBtn.textContent = 'Enviado';
}
closeFeedbackModalBtn.addEventListener('click', hideFeedbackModal);
feedbackModal.addEventListener('click', (event) => { if (event.target === feedbackModal) hideFeedbackModal(); });
window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && feedbackModal.style.display === 'flex') hideFeedbackModal(); });
}