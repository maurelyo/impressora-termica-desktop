# node-impressora-termica
Node.js module to integrate web applications with local thermal printer configured in Windows.

## Setup

### Prerequisites

- Install [TM-T20 Utility v1.50](https://epson.com.br/Suporte/Ponto-de-venda/Impressoras-t%C3%A9rmicas/Epson-TM-T20/s/SPT_C31CB10023?review-filter=Windows+10+64-bit#panel-drivers-1-5) 
- Install [Epson TM Driver de porta virtual v8.60a](https://epson.com.br/Suporte/Ponto-de-venda/Impressoras-t%C3%A9rmicas/Epson-TM-T20/s/SPT_C31CB10023?review-filter=Windows+10+64-bit#panel-drivers--10)
- Install [Node.js and npm](https://nodejs.org/en/download/)
- Configure printer to LPT2 port

### Setting Up the Module

Install dependencies and create Windows Service:

```
npm i && npm run install-windows
```

### Want to Help?

To check if the `LienceSoft - Impressora` was started, by Ctrl+R and typing:

```
services.msc
```
