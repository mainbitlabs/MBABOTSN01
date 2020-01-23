const config = require('../config');
const azurest = require('azure-storage');
const image2base64 = require('image-to-base64');
const blobService = azurest.createBlobService(config.storageA,config.accessK);
const tableSvc = azurest.createTableService(config.storageA, config.accessK);

const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory, TextPrompt,AttachmentPrompt } = require('botbuilder-dialogs');

const { MailDialog, MAIL_DIALOG } = require('./MAIL');
const FALLA_DIALOG = "FALLA_DIALOG";
const CHOICE_PROMPT = "CHOICE_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const ATTACH_PROMPT = "ATTACH_PROMPT";
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class FallaDialog extends ComponentDialog {
    constructor(){
        super(FALLA_DIALOG);
        this.addDialog(new MailDialog());
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new AttachmentPrompt(ATTACH_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this),
            this.secondStep.bind(this),
            this.fechaStep.bind(this),
            this.horarioStep.bind(this),
            this.telefonoStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;

    }

    async firstStep(step) {
    console.log('[FallaDialog]: firstStep');
    
    return await step.prompt(CHOICE_PROMPT, {
        prompt: '**Que tipo de falla quieres reportar.**',
        choices: ChoiceFactory.toChoices(['Software', 'Hardware'])
        
    });
}

async secondStep(step) {
    console.log('[FallaDialog]: secondStep');
    const level2 = step.result.value;
    const sol = config.solicitud;
    sol.level2 = level2;
        // console.log(config.solicitud);
        switch (level2) {
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
        }

    }
    
    async fechaStep(step) {
        console.log('[FallaDialog]: fechaStep');
        const level3 = step.result.value;
        const sol = config.solicitud;
        sol.level3 = level3;
        // console.log(config.solicitud);
        return await step.prompt(TEXT_PROMPT, 'Indica **día y mes** (DD/MM),para realizar la atención.');
            
    }
    async horarioStep(step){
        console.log('[peticion]: horarioDialog');
        const fecha = step.result;
        config.atencion = {};
        const att = config.atencion;
        att.fecha = fecha;
    
        return await step.prompt(CHOICE_PROMPT,{
            prompt:'Indica el horario, para realizar la atención.',
            choices: ChoiceFactory.toChoices(['9 a 12 am', '12 a 2 pm', '3 a 5 pm', '5 a 7 pm'])
        });
    }
    async telefonoStep(step){
        console.log('[peticion]: telefonoDialog');
        const horario = step.result.value;
        const att = config.atencion;
        att.horario = horario;
    
        console.log(config.atencion);
        return await step.prompt(TEXT_PROMPT, 'Indica **teléfono / celular**, para contactarte.');
    }
    async finalStep(step){
        console.log('[FallaDialog]: finalStep');
        const tel = step.result;
        const att = config.atencion;
        att.tel = tel;
    
        console.log(config.atencion);
        return await step.beginDialog(MAIL_DIALOG);
    }
}
module.exports.FallaDialog = FallaDialog;
module.exports.FALLA_DIALOG = FALLA_DIALOG;