# EnablePay

Sistema de gestão financeira inteligente, controle de notas promissórias, contas a pagar, amortizações e quitações.

- **URL de Produção:** [https://enablepay.vercel.app/](https://enablepay.vercel.app/)

## Funcionalidades
- **Gestão de Dívidas e Promissórias:** Cadastro de contas por pessoa, especificação de débitos e cálculo automático de parcelamento.
- **Amortização Inteligente:** Abatimento de pagamentos das últimas parcelas em aberto para as primeiras (redução do prazo da dívida).
- **Extrato Completo:** Acompanhamento de parcelas pagas, pendentes e histórico detalhado de quitações com impressão de comprovante.
- **Segurança de Dados:** Persistência em localStorage com migração automática e redundância.

## Executando Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Para compilar a versão de produção:
   ```bash
   npm run build
   ```
