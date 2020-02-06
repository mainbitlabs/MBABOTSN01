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

        return await step.prompt(TEXT_PROMPT, 'Indica **día y mes** (DD/MM),para realizar la atención.');
            
    }
    async horarioStep(step){
        console.log('[MailDialog]: horarioDialog');
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
        console.log('[MailDialog]: telefonoDialog');
        const horario = step.result.value;
        const att = config.atencion;
        att.horario = horario;
    
        console.log(config.atencion);
        return await step.prompt(TEXT_PROMPT, 'Escribe tu **teléfono / celular**, para contactarte.');
    }
    async correoStep(step){
        console.log('[MailDialog]: correoStep');
        const tel = step.result;
        const att = config.atencion;
        att.tel = tel;
    
        console.log(config.atencion);
        return await step.prompt(TEXT_PROMPT, 'Escribe tu **correo electrónico** para enviarte los detalles del servicio.');
    }
    async mailStep(step){
        console.log('[MailDialog]: mailStep');
        const mail = step.result;
        const att = config.atencion;
        att.email = mail;
    
        console.log(config.atencion);
        console.log(config.solicitud);
        const result = await azureTS.retrieveEntityAsync(tableSvc1, config.table3, 'CASM', config.casm);
        config.sendemail = result.Contacto._;
        moment.locale('es');
    const cdmx = moment().tz("America/Mexico_City");
    console.log(cdmx.format('LLL'));

        const email = new Promise((resolve, reject) => { 
            nodeoutlook.sendEmail({
                auth: {
                    user: `${config.email1}`,
                    pass: `${config.pass}`,
                }, from: `${config.email1}`,
                to: `${config.atencion.email}`,
                bcc: `${config.sendemail}`,
                subject: `${config.proyecto} Tipo de solicitud: ${config.solicitud.level1}: ${config.serie} / ${config.solicitud.level2} / ${config.solicitud.level3}`,
                html: `<p>Estimado <b>${config.usuario}</b>, usted ha levantado una solicitud de servicio con la siguiente información:</p>

                <p>Día y hora de registro del servicio: <b>${cdmx.format('LLL')}</b> </p>

                <p>La solicitud registrada es: <b>${config.solicitud.level1} / ${config.solicitud.level2} / ${config.solicitud.level3}</b></p> 
                <hr>
                <b>Cita programada: ${config.atencion.fecha}, ${config.atencion.horario}, ${config.atencion.tel}</b> 
                <hr>
                <p>Datos del equipo reportado:</p><br> 
                <b>Proyecto: ${config.proyecto}</b>  <br> 
                <b>Modelo: ${config.modelo}</b> <br> 
                <b>Serie: ${config.serie}</b> <br> 
                <b>Usuario: ${config.usuario}</b> <br> 
                <b>Marca: ${config.marca}</b> <br> 
                <b>Dirección: ${config.direccion}</b> <br> 
                <b>Estado: ${config.estado}</b> <br> 
                <b>Inmueble: ${config.inmueble}</b> <br> 
                <b>Teléfono: ${config.telefono}</b> <br> 
                <b>Extensión: ${config.ext}</b> <br>
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

        await step.context.sendActivity(`**Gracias por tu apoyo, se enviará un correo con tu solicitud:**\n\n ‣${config.solicitud.level1} de ${config.solicitud.level2} ${config.solicitud.level3} \n\n **Tu horario de atención será:**\n\n ‣ ${config.atencion.fecha}, ${config.atencion.horario}`);
        await step.cancelAllDialogs();
        return await step.endDialog();

    }   

}
module.exports.MailDialog = MailDialog;
module.exports.MAIL_DIALOG = MAIL_DIALOG;