// IMPORTANTE: Cole aqui a URL completa da implantação do seu Google Apps Script.
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyGfw0g-0qyfHqJoWgljH1IlsORDcht8kxLeEic_Zu6GnsRk5y2UlbB0yGqY2dVOUHRSA/exec";

// --- LÓGICA DA PÁGINA INICIAL (index.html) ---
if (document.getElementById('lerMaisBtn')) {
    const lerMaisBtn = document.getElementById('lerMaisBtn');
    const emailModal = document.getElementById('emailModal');
    const emailForm = document.getElementById('emailForm');

    lerMaisBtn.addEventListener('click', () => {
        emailModal.classList.add('visible');
    });

    emailForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('#emailInput').value;
        if (email) {
            e.target.querySelector('button').textContent = 'Aguarde...';
            const data = { type: 'newUser', email: email };
            fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' },
            })
            .then(res => res.json())
            .then(result => {
                if(result.result === 'success') {
                    localStorage.setItem('userEmail', email);
                    window.location.href = 'perfil.html';
                } else {
                    throw new Error(result.message || 'Erro desconhecido do script.');
                }
            }).catch(error => {
                console.error('Erro no envio:', error.message);
                e.target.querySelector('button').textContent = 'Acessar Conteúdo';
                alert('Ocorreu um erro. Verifique sua conexão ou as configurações do script e tente novamente.');
            });
        }
    });
}

// --- LÓGICA DA PÁGINA DE PERFIL (perfil.html) ---
if (document.getElementById('radarChart')) {
    // PROTEÇÃO DA PÁGINA
    if (!localStorage.getItem('userEmail')) {
        window.location.href = 'index.html';
    }

    let chartData = []; 
    const chartColors = ['#DC2626', '#16A34A', '#D97706', '#9333EA', '#CA8A04', '#6D28D9', '#DB2777'];

    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    const legendContainer = document.getElementById('chartLegend');
    const experienceBox = document.querySelector('#experienceBox p');
    const commentBox = document.querySelector('#commentBox p');

    function loadAndRenderCharts() {
        fetch(SCRIPT_URL)
            .then(res => res.json())
            .then(data => {
                chartData = data.bancoDeDados.slice(1);
                renderRadarChart(chartData);
                renderBarChart(chartData);
                generateInteractiveLegend(chartData);

                // Esconde o preloader e mostra o conteúdo
                preloader.style.opacity = '0';
                mainContent.style.visibility = 'visible';
                mainContent.style.opacity = '1';
                setTimeout(() => { preloader.style.display = 'none'; }, 500); // Remove o preloader após a transição
            });
    }

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
    
    function displayDetails(index) {
        const selectedData = chartData[index];
        experienceBox.textContent = selectedData[2];
        commentBox.textContent = selectedData[3];
    }

    function renderRadarChart(data) {
        const ctx = document.getElementById('radarChart').getContext('2d');
        const labels = data.map(row => row[0]);
        const values = data.map(row => row[1]);

        new Chart(ctx, { /* ...Configuração do Gráfico Radar... */ });
    }
    
    function renderBarChart(data) {
        const ctx = document.getElementById('barChart').getContext('2d');
        const labels = data.map(row => row[0]);
        const values = data.map(row => row[1]);

        new Chart(ctx, { /* ...Configuração do Gráfico de Barras... */ });
    }

    loadAndRenderCharts();

    // --- LÓGICA DO SISTEMA DE ESTRELAS ---
    const stars = document.querySelectorAll('.star');
    let currentRating = 0;

    function paintStars(rating) {
        stars.forEach(star => {
            star.classList.remove('selected');
            if (star.dataset.value <= rating) {
                star.classList.add('selected');
            }
        });
    }

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            for (let i = 0; i < 10; i++) {
                stars[i].classList.toggle('hover', i < star.dataset.value);
            }
        });
        star.addEventListener('mouseout', () => {
            stars.forEach(s => s.classList.remove('hover'));
        });
        star.addEventListener('click', () => { /* ...Lógica do clique da estrela... */ });
    });

    // --- LÓGICA DE ENVIO DE COMENTÁRIO ---
    document.getElementById('sendCommentBtn').addEventListener('click', () => { /* ...Lógica do comentário... */ });
}
