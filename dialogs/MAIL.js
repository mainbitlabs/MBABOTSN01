/**

  __  __          _____ _      
 |  \/  |   /\   |_   _| |     
 | \  / |  /  \    | | | |     
 | |\/| | / /\ \   | | | |     
 | |  | |/ ____ \ _| |_| |____ 
 |_|  |_/_/    \_\_____|______|
                               
                               

 */
const config = require('../config');
const azurest = require('azure-storage');
const nodeoutlook = require('nodejs-nodemailer-outlook');
const tableSvc1 = azurest.createTableService(config.storageA1, config.accessK1);
const azureTS = require('azure-table-storage-async');
const moment = require('moment-timezone');

const { ComponentDialog, WaterfallDialog, ChoicePrompt, TextPrompt,AttachmentPrompt, ChoiceFactory } = require('botbuilder-dialogs');

const MAIL_DIALOG = "MAIL_DIALOG";
const CHOICE_PROMPT = "CHOICE_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const ATTACH_PROMPT = "ATTACH_PROMPT";
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class MailDialog extends ComponentDialog {
    constructor(){
        super(MAIL_DIALOG);
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new AttachmentPrompt(ATTACH_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.fechaStep.bind(this),
            this.horarioStep.bind(this),
            this.telefonoStep.bind(this),
            this.correoStep.bind(this),
            this.mailStep.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;
    }
    async fechaStep(step) {
        console.log('[MailDialog]: fechaStep');
        const details = step.options;
console.log(details);

        return await step.prompt(TEXT_PROMPT, 'Indica **día y mes** (DD/MM),para realizar la atención.');
            
    }
    async horarioStep(step){
        console.log('[MailDialog]: horarioStep');
        const details = step.options;
        const fecha = step.result;
        details.atencion = {};
        const att = details.atencion;
        att.fecha = fecha;
    
        return await step.prompt(CHOICE_PROMPT,{
            prompt:'Indica el horario, para realizar la atención.',
            choices: ChoiceFactory.toChoices(['9 a 12 am', '12 a 2 pm', '3 a 5 pm', '5 a 7 pm'])
        });
    }
    async telefonoStep(step){
        console.log('[MailDialog]: telefonoStep');
        const details = step.options;
        const horario = step.result.value;
        const att = details.atencion;
        att.horario = horario;
    
        console.log(details.atencion);
        return await step.prompt(TEXT_PROMPT, 'Escribe tu **teléfono / celular**, para contactarte.');
    }
    async correoStep(step){
        console.log('[MailDialog]: correoStep');
        const details = step.options;
        const tel = step.result;
        const att = details.atencion;
        att.tel = tel;
    
        console.log(details.atencion);
        return await step.prompt(TEXT_PROMPT, 'Escribe tu **correo electrónico** para enviarte los detalles del servicio.');
    }
    async mailStep(step){
        console.log('[MailDialog]: mailStep');
        const details = step.options;
        const mail = step.result;
        const att = details.atencion;
        att.email = mail;
    
        console.log(details.atencion);
        console.log(details.solicitud);
        const result = await azureTS.retrieveEntityAsync(tableSvc1, config.table3, 'CASM', details.casm);
        details.sendemail = result.Contacto._;
        moment.locale('es');
        const cdmx = moment().tz("America/Mexico_City");
        console.log(cdmx.format('LLL'));

        const email = new Promise((resolve, reject) => { 
            nodeoutlook.sendEmail({
                auth: {
                    user: `${config.email1}`,
                    pass: `${config.pass}`,
                }, from: `${config.email1}`,
                to: `${details.atencion.email}`,
                bcc: `${details.sendemail}`,
                subject: `${details.proyecto} Tipo de solicitud: ${details.solicitud.level1}: ${details.serie} / ${details.solicitud.level2} / ${details.solicitud.level3}`,
                html: `<p>Estimado <b>${details.usuario}</b>, usted ha levantado una solicitud de servicio con la siguiente información:</p>

                <p>Día y hora de registro del servicio: <b>${cdmx.format('LLL')}</b> </p>

                <p>La solicitud registrada es: <b>${details.solicitud.level1} / ${details.solicitud.level2} / ${details.solicitud.level3}</b></p> 
                <hr>
                <b>Cita programada: ${details.atencion.fecha}, ${details.atencion.horario}, ${details.atencion.tel}</b> 
                <hr>
                <p>Datos del equipo reportado:</p><br> 
                <b>Proyecto: ${details.proyecto}</b>  <br> 
                <b>Modelo: ${details.modelo}</b> <br> 
                <b>Serie: ${details.serie}</b> <br> 
                <b>Usuario: ${details.usuario}</b> <br> 
                <b>Marca: ${details.marca}</b> <br> 
                <b>Dirección: ${details.direccion}</b> <br> 
                <b>Estado: ${details.estado}</b> <br> 
                <b>Inmueble: ${details.inmueble}</b> <br> 
                <b>Teléfono: ${details.telefono}</b> <br> 
                <b>Extensión: ${details.ext}</b> <br>
                <hr> 
                <p>En breve nuestro ingeniero se comunicará con usted.</p>
                <p>Un placer atenderle.</p>
                <p>Equipo Mainbit.</p>
                <hr>
                <img style="width:100%" src="https://raw.githubusercontent.com/esanchezlMBT/images/master/firma2020.jpg">
                `,
                onError: (e) => reject(console.log(e)),
                onSuccess: (i) => resolve(console.log(i))
                }
            );
            
        });
        await result;
        await email;

        await step.context.sendActivity(`**Gracias por tu apoyo, se enviará un correo con tu solicitud:**\n\n ‣${details.solicitud.level1} de ${details.solicitud.level2} ${details.solicitud.level3} \n\n **Tu horario de atención será:**\n\n ‣ ${details.atencion.fecha}, ${details.atencion.horario}`);
        await step.cancelAllDialogs();
        return await step.endDialog();

    }   

}
module.exports.MailDialog = MailDialog;
module.exports.MAIL_DIALOG = MAIL_DIALOG;