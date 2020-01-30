const config = require('../config');
const azurest = require('azure-storage');
var nodeoutlook = require('nodejs-nodemailer-outlook');
const tableSvc1 = azurest.createTableService(config.storageA1, config.accessK1);
const azureTS = require('azure-table-storage-async');

const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory, TextPrompt,AttachmentPrompt } = require('botbuilder-dialogs');

const { MailDialog, MAIL_DIALOG } = require('./MAIL');
const PETICION_DIALOG = "PETICION_DIALOG";
const CHOICE_PROMPT = "CHOICE_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const ATTACH_PROMPT = "ATTACH_PROMPT";
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class PeticionDialog extends ComponentDialog {
    constructor(){
        super(PETICION_DIALOG);
        this.addDialog(new MailDialog());
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new AttachmentPrompt(ATTACH_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this),
            this.fechaStep.bind(this),
            this.horarioStep.bind(this),
            this.telefonoStep.bind(this),
            this.correoStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;

    }

    async firstStep(step) {
    console.log('[PeticionDialog]: firstStep');
    
    return await step.prompt(CHOICE_PROMPT,{
        prompt:'**Que petición deseas realizar**',
        choices: ChoiceFactory.toChoices(['Aplicativo', 'Periferico', 'Alta de red', 'Resguardo'])
    });
}

async fechaStep(step){
    console.log('[peticion]: fechaStep');
    
    const peticion = step.result.value;
    const sol = config.solicitud;
    sol.level2 = peticion;
    sol.level3= "";
    // console.log(config.solicitud);
    return await step.prompt(TEXT_PROMPT, 'Indica **día y mes** (DD/MM),para realizar la atención.');
}

async horarioStep(step){
    console.log('[peticion]: horarioStep');
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
    console.log('[peticion]: telefonoStep');
    const horario = step.result.value;
    const att = config.atencion;
    att.horario = horario;

    console.log(config.atencion);
    return await step.prompt(TEXT_PROMPT, 'Escribe tu **teléfono / celular**, para contactarte.');
}
async correoStep(step){
    console.log('[peticion]: correoStep');
    const tel = step.result;
    const att = config.atencion;
    att.tel = tel;

    console.log(config.atencion);
    return await step.prompt(TEXT_PROMPT, 'Escribe tu **correo electrónico** para enviarte los detalles del servicio.');
}

async finalStep(step){
    console.log('[peticion]: finalStep');
    const email = step.result;
    const att = config.atencion;
    att.email = email;

    console.log(config.atencion);
    return await step.beginDialog(MAIL_DIALOG);
}

}
module.exports.PeticionDialog = PeticionDialog;
module.exports.PETICION_DIALOG = PETICION_DIALOG;