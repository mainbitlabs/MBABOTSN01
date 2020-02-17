// ENVÍA UN CORREO INDICANDO QUE HAY DATOS INCORRECTOS EN LA BASE DE DATOS.
/** 
 __  __          _____ _      ______ _____  
|  \/  |   /\   |_   _| |    |  ____|  __ \ 
| \  / |  /  \    | | | |    | |__  | |__) |
| |\/| | / /\ \   | | | |    |  __| |  _  / 
| |  | |/ ____ \ _| |_| |____| |____| | \ \ 
|_|  |_/_/    \_\_____|______|______|_|  \_\
                                                    
*/
const config = require('../config');
const azurest = require('azure-storage');
const nodeoutlook = require('nodejs-nodemailer-outlook');
const tableSvc1 = azurest.createTableService(config.storageA1, config.accessK1);
const azureTS = require('azure-table-storage-async');
const moment = require('moment-timezone');

const { ComponentDialog, WaterfallDialog, ChoicePrompt, TextPrompt,AttachmentPrompt } = require('botbuilder-dialogs');

const MAILER_DIALOG = "MAILER_DIALOG";
const CHOICE_PROMPT = "CHOICE_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const ATTACH_PROMPT = "ATTACH_PROMPT";
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class MailerDialog extends ComponentDialog {
    constructor(){
        super(MAILER_DIALOG);
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new AttachmentPrompt(ATTACH_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.mailStep.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;
    }

async mailStep(step){
    console.log('[MailerDialog]: mailStep');
    const details = step.options;
    console.log(details);
    
    moment.locale('es');
    const cdmx = moment().tz("America/Mexico_City");
    console.log(cdmx.format('LLL'));
    
    const email = new Promise((resolve, reject) => { 
        nodeoutlook.sendEmail({
            auth: {
                user: `${config.email1}`,
                pass: `${config.pass}`,
            }, from: `${config.email1}`,
            to: `${config.email3}`,

            subject: `${details.proyecto} Error en los datos de la serie: ${details.serie} `,
            html: `<p>El usuario <b>${details.usuario}</b>, reporta un error en los datos de la serie ${details.serie}.</p>

            <p>Día y hora de registro del servicio: <b>${cdmx.format('LLL')}</b> </p>
            <hr>
            <b>Contacta al usuario para corregir los datos: ${details.telefono}</b> 
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
    
    await email;

    await step.context.sendActivity(`**Gracias por tu apoyo, se enviará un correo notificando que hay un error en los datos.**`);
    await step.cancelAllDialogs();
    return await step.endDialog();

    }   

}
module.exports.MailerDialog = MailerDialog;
module.exports.MAILER_DIALOG = MAILER_DIALOG;