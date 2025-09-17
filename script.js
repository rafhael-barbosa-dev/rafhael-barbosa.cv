const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwcxGwL1n2B6tb3JUbSVqs1PH9wA5-nebKtqa4G3tCVKhrQtQCI2zUYIqvWYEAmHG2t/exec"; // <-- COLE SUA URL AQUI!

// Lógica para a PÁGINA INICIAL (index.html)
if (document.getElementById('lerMaisBtn')) {
    const lerMaisBtn = document.getElementById('lerMaisBtn');
    const emailModal = document.getElementById('emailModal');
    const emailForm = document.getElementById('emailForm');
    const emailInput = document.getElementById('emailInput');

    lerMaisBtn.addEventListener('click', () => {
        emailModal.style.display = 'block'; // Mostra o modal
    });

    emailForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o envio padrão do formulário
        const email = emailInput.value;
        if (email) {
            const data = { type: 'newUser', email: email };
            
            fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(result => {
                if(result.result === 'success') {
                    // Salva o e-mail no navegador para usar depois
                    localStorage.setItem('userEmail', email);
                    // Redireciona para a página de perfil
                    window.location.href = 'perfil.html';
                }
            }).catch(error => console.error('Error!', error.message));
        }
    });
}


// Lógica para a PÁGINA DE PERFIL (perfil.html)
if (document.getElementById('myChart')) {
    let chartData = []; // Armazenará os dados do "Banco de dados"

    // Função para buscar os dados da planilha
    function loadChartData() {
        fetch(SCRIPT_URL)
            .then(res => res.json())
            .then(data => {
                // Remove o cabeçalho (primeira linha) dos dados
                chartData = data.bancoDeDados.slice(1);
                renderChart(chartData);
                // Você pode usar data.viacharacter para popular outra seção
            });
    }

    // Função para desenhar o gráfico
    function renderChart(data) {
        const ctx = document.getElementById('myChart').getContext('2d');
        const labels = data.map(row => row[0]); // Coluna "Area"
        const values = data.map(row => row[1]); // Coluna "Autoavaliação"

        new Chart(ctx, {
            type: 'radar', // Ou 'bar' para gráfico de barras
            data: {
                labels: labels,
                datasets: [{
                    label: 'Autoavaliação',
                    data: values,
                    backgroundColor: 'rgba(0, 82, 204, 0.2)',
                    borderColor: 'rgba(0, 82, 204, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const clickedIndex = elements[0].index;
                        const clickedData = data[clickedIndex];
                        
                        const experience = clickedData[2]; // Coluna "Experiencias"
                        const comment = clickedData[3];    // Coluna "Comentário"

                        // Atualiza as caixas de texto
                        document.querySelector('#experienceBox p').textContent = experience;
                        document.querySelector('#commentBox p').textContent = comment;
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10 // Define a escala de 0 a 10
                    }
                }
            }
        });
    }

    // Carrega os dados assim que a página é aberta
    loadChartData();

    // Lógica para enviar comentários
    const sendCommentBtn = document.getElementById('sendCommentBtn');
    sendCommentBtn.addEventListener('click', () => {
        const comment = document.getElementById('commentInput').value;
        const userEmail = localStorage.getItem('userEmail');

        if(comment && userEmail) {
            const data = { type: 'newComment', email: userEmail, comment: comment };

            fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(data => {
                alert('Obrigado pelo seu comentário!');
                document.getElementById('commentInput').value = '';
            });
        }
    });

}

