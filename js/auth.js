// Nomes das chaves
const DB_KEY = 'churnguard_db';
const SESSION_KEY = 'churnguard_sessao';

// Função assíncrona para carregar o ficheiro JSON para o localStorage

async function carregarBaseDeDados() {

    //Verifica se já existe uma cópia guardada no navegador
    const dadosGuardados = localStorage.getItem(DB_KEY);

    if(!dadosGuardados){
        // Se não existir, vai buscar o ficheiro JSON à pasta data/
        const resposta = await fetch('data/mock_data.json');
        const dadosJSON = await resposta.json();

        // Converter o objeto JavaScript em texto e guarda no localStorage
        localStorage.setItem(DB_KEY, JSON.stringify(dadosJSON));
        return dadosJSON;   
    }

    // Se já existir, converte o texto de volta para objeto JavaScript
    return JSON.parse(dadosGuardados);
}

// Função chamada pelos botões de "Preenchimento rápido" no HTML
function preencherDemo(emailDemo){
    document.getElementById('email').value = emailDemo;
    document.getElementById('password').value = '123';
}

// Lógica do formulário de Login
const formLogin = document.getElementById('form-login');

if(formLogin){
    // Carrega logo os dados assim que a página abre
    carregarBaseDeDados();

    //Fica à escuta do clique no botão "Entrar" (evento 'submit')
    formLogin.addEventListener('submit', async function (evento) {
        //Impede a página de recarregar (compartamento padrão do HTML)
        evento.preventDefault();

        //Lê o que o utilizador escreveu nos inputs (.trim() remove espaços extra)
        const emailDigitado = document.getElementById('email').value.trim();
        const passwordDigitada = document.getElementById('password').value.trim();
        const caixaErro = document.getElementById('mensagem-erro');

        //Vai buscar a base de dados (JSON)
        const db = await carregarBaseDeDados();

        //Procura na lista 'utilizadores' alguém com o mesmo email e password
        const utilizador = db.utilizadores.find(
            (u) => u.email === emailDigitado && u.password === passwordDigitada
        );

        // Se não encontrar, mostra erro e para aqui
        if (!utilizador){
            caixaErro.textContent = 'E-mail ou palavra-passe incorretos.';
            caixaErro.classList.remove('d-none'); //Torna a caixa vermelha vísivel
            return;
        }

        //Verifica se a conta está ativa
        if (!utilizador.ativo){
            caixaErro.textContent = 'Esta conta encontra-se desativada.';
            caixaErro.classList.remove('d-none');
            return;
        }

        //Vai buscar o nome do perfil (Admin ou Gestor) à tabela 'perfis' usando o perfil_id
        const perfil = db.perfis.find((p) => p.id === utilizador.perfil_id);

        //Cria um objeto de sessão com os dados necessários para o Dashboard
        const sessao = {
            id: utilizador.id,
            nome: utilizador.nome,
            email: utilizador.email,
            perfil_id: utilizador.perfil_id,
            perfil_nome: perfil ? perfil.nome : 'Desconhecido'
        };

        //Guarda a sessão ativa no sessionStorage (apaga-se quando fechas o separador)
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessao));

        //Redireciona o utilizador para o painel principal
        window.location.href = 'dashboard.html'
    });
}

// Funções auxiliares para o dashboard.html
function obterUtilizadorLogado(){
    const sessaoTexto = sessionStorage.getItem(SESSION_KEY);
    if (!sessaoTexto){
        //Se alguém tentar abrir o dashboard.html sem fazer login, volta para o index.html
        window.location.href = 'index.html';
        return null;
    }
    return JSON.parse(sessaoTexto);
}

function terminarSessao() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
}