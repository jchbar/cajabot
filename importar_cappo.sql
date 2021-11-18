delete from ahorros_socios where idempresa="CAPPOUCLA";
insert into ahorros_socios (idempresa, codigo, cedula, apellido, nombre, status_socio, aporte_patron, aporte_socio, aporte_extra, haberes_patron, haberes_socio, haberes_extra, haberes_dividendo, haberes_opsu, ultimo_aporte_socio, ultimo_aporte_patron, ultimo_aporte_extra, ultimo_aporte_dividendo)
select 'CAPPOUCLA' as idempresa, cod_prof as codigo, ced_prof as cedula, ape_prof as apellido, nombr_prof as nombre, statu_prof as status_socio, aport_empr as aporte_patron, aport_prof as aporte_socio, aport_extr as aporte_extra, hab_f_empr as haberes_patron, hab_f_prof as haberes_socio, hab_f_extr as haberes_extra, 0 as  haberes_dividendo, hab_opsu as haberes_opsu, ultap_prof as ultimo_aporte_socio, ultap_emp as ultimo_aporte_patron, ultap_extr as ultimo_aporte_extra, ultap_div as ultimo_aporte_dividendo from heroscom_sicacap.sgcaf200 ;

delete from prestamos_tipos where idempresa="CAPPOUCLA";
insert into prestamos_tipos (
	idempresa, codigo, descripcion, maximo_cuotas, interes, afecta_disponibilidad, descuento_semanal
	)
select 'CAPPOUCLA' as idempresa, cod_pres as codigo, descr_pres as descripcion, i_max_pres as interes, 
n_cuo_pres as maximo_cuotas, if(retab_pres=1,'Si','No') as afecta_disponibilidad, 
if(dcto_sem=1,'Si','No') as descuento_semanal
from heroscom_sicacap.sgcaf360 ;


delete from prestamos_socios where idempresa="CAPPOUCLA";
insert into prestamos_socios (
	idempresa, codigo_socio, cedula, 
    numero_prestamo, codigo_prestamo, fecha_solicitud, 
	fecha_1er_dcto, ultima_cuota_pagada, numero_de_cuotas, 
    monto_prestamo, monto_pagado,
	estatus_prestamo, cuota, interes, cuota_patron, 
    renovado, renovado_por,
	 paga_hasta
	)
select 'CAPPOUCLA' as idempresa, codsoc_sdp as codigo_socio, cedsoc_sdp as cedula,
nropre_sdp as numero_prestamo, codpre_sdp as codigo_prestamo, f_soli_sdp as fecha_solicitud, 
f_1cuo_sdp as fecha_1er_dcto, ultcan_sdp as ultima_cuota_pagada, nrocuotas as numero_de_cuotas, 
monpre_sdp as monto_prestamo, monpag_sdp as monto_pagado, 
if(stapre_sdp='A','A','C'), cuota, interes_sd as interes, cuota_ucla as cuota_patron, 
if(renovado=1,'Si','No'), renova_por as renovado_por, 
paga_hasta 
from heroscom_sicacap.sgcaf310 ;
