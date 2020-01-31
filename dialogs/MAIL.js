const config = require('../config');
const azurest = require('azure-storage');
var nodeoutlook = require('nodejs-nodemailer-outlook');
const tableSvc1 = azurest.createTableService(config.storageA1, config.accessK1);
const azureTS = require('azure-table-storage-async');
const moment = require('moment');
moment.locale('es');

const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory, TextPrompt,AttachmentPrompt } = require('botbuilder-dialogs');

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
            this.mailStep.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;

    }

async mailStep(step){
    console.log('[MailDialog]: mailStep');
    console.log(config.solicitud);

    const result = await azureTS.retrieveEntityAsync(tableSvc1, config.table3, 'CASM', config.casm);
    config.sendemail = result.Contacto._;
    // const meses = new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
    // var f = new Date();
    // f.setHours(f.getHours()-6);
    // var now = f.toLocaleString();

    
    const email = new Promise((resolve, reject) => {
        
        // <p>Día y hora de registro del servicio:${f.getDate()} de ${meses[f.getMonth()]} del ${f.getFullYear()} ${f.getUTCHours()}<span>:</span>${f.getMinutes()} </p>
        nodeoutlook.sendEmail({
            auth: {
                user: `${config.email1}`,
                pass: `${config.pass}`,
            }, from: `${config.email1}`,
            to: `${config.atencion.email}`,
            bcc: `${config.sendemail}`,
            subject: `${config.proyecto} Tipo de solicitud: ${config.solicitud.level1}: ${config.serie} / ${config.solicitud.level2} / ${config.solicitud.level3}`,
            html: `<p>Estimado <b>${config.usuario}</b>, usted ha levantado una solicitud de servicio con la siguiente información:</p>

            <p>Día y hora de registro del servicio:${moment().format('LLL')} </p>

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
            `,
            onError: (e) => reject(console.log(e)),
            onSuccess: (i) => resolve(console.log(i))
            }
        );
        
    });
    await result;
    await email;

    await step.context.sendActivity(`**Gracias por tu apoyo, se enviará un correo con tu solicitud:**\n\n ‣${config.solicitud.level1} de ${config.solicitud.level2} ${config.solicitud.level3} \n\n **Tu horario de atención será:**\n\n ‣ ${config.atencion.fecha}, ${config.atencion.horario}`);
    return await step.endDialog();

    }   

}
module.exports.MailDialog = MailDialog;
module.exports.MAIL_DIALOG = MAIL_DIALOG;