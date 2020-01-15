const config = require('../config');

const azurest = require('azure-storage');
const image2base64 = require('image-to-base64');
const blobService = azurest.createBlobService(config.storageA,config.accessK);
const tableSvc = azurest.createTableService(config.storageA, config.accessK);
const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory, TextPrompt,AttachmentPrompt } = require('botbuilder-dialogs');

const FALLA_DIALOG = "FALLA_DIALOG";
const CHOICE_PROMPT = "CHOICE_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const ATTACH_PROMPT = "ATTACH_PROMPT";
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';


class FallaDialog extends ComponentDialog {
    constructor(){
        super(FALLA_DIALOG);
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new AttachmentPrompt(ATTACH_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.choiceStep.bind(this),
            this.adjuntaStep.bind(this),
            this.dispatcherStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;

    }

    async choiceStep(step) {
    console.log('[FallaDialog]: choiceStep');
    
    return await step.prompt(CHOICE_PROMPT, {
        prompt: '**Que tipo de falla quieres reportar.**',
        choices: ChoiceFactory.toChoices(['Software', 'Hardware', 'General'])
        
    });
}

async adjuntaStep(step) {
    console.log('[FallaDialog]: tipoStep');
        const tipo = step.result.value;
        const sol = config.solicitud;
        sol.hs = tipo;
        console.log(config.solicitud);
        switch (tipo) {
            case "Hardware":
                return await step.prompt(CHOICE_PROMPT,{
                    prompt:'Elije una opción',
                    choices: ChoiceFactory.toChoices(['Mouse', 'Teclado', 'Monitor', 'PC', 'Laptop', 'Docking', 'Impresora', 'No Break'])
                });
            case "Software":
            
                return await step.prompt(CHOICE_PROMPT,{
                    prompt:'Tipo de aplicativo que deseas reportar',
                    choices: ChoiceFactory.toChoices(['Institucional', 'Comercial'])
                });
            case "General":
            
                return await step.prompt(CHOICE_PROMPT,{
                    prompt:'Tipo de aplicativo que deseas reportar',
                    choices: ChoiceFactory.toChoices(['Red', 'Correo','CarpetaCompartida', 'Permisos','Bloqueodecuenta'])
                });

        }

    }
    

    async dispatcherStep(step) {
        console.log('[FallaDialog]: dispatcherStep');

        const selection = step.result.value;
        const sol = config.solicitud;
        sol.categoria = selection;
        console.log(config.solicitud);
        return await step.prompt(TEXT_PROMPT, `¿En que horario y día nos puedes atender?`);
        
        // switch (selection) {
            
        //     case 'Institucional', 'Comercial':
                
        //         return await step.prompt(TEXT_PROMPT, `¿En que horario y día nos puedes atender?`);
                
        //     case 'Mouse', 'Teclado', 'Monitor', 'PC', 'Laptop', 'Docking', 'Impresora', 'No Break':
        
               
        //         return await step.prompt(TEXT_PROMPT, `¿En que horario y día nos puedes atender?`);

        //     case 'Red', 'Correo','CarpetaCompartida', 'Permisos','Bloqueodecuenta':
        
            
        //         return await step.prompt(TEXT_PROMPT, `¿En que horario y día nos puedes atender?`);

           
        // }
    }

    async finalStep(step){
        console.log('[FallaDialog]: finalStep');
        const horario = step.result;
        const sol = config.solicitud;
        sol.date = horario;
        console.log(config.solicitud);
        
        
        await step.context.sendActivity(`Gracias por tu apoyo \n\n Tu solicitud fue: ${config.solicitud.tipo} \n\n ${config.solicitud.hs} \n\n ${config.solicitud.categoria} \n\n ${config.solicitud.date}`)
        return await step.cancelAllDialogs();

        

    }


    

}
module.exports.FallaDialog = FallaDialog;
module.exports.FALLA_DIALOG = FALLA_DIALOG;