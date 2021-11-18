delete from ahorros_socios where idempresa="CAPUCLA";


insert into ahorros_socios (idempresa, codigo, cedula, apellido, nombre, status_socio, aporte_patron, aporte_socio, aporte_extra, haberes_patron, haberes_socio, haberes_extra, haberes_dividendo, haberes_opsu, ultimo_aporte_socio, ultimo_aporte_patron, ultimo_aporte_extra, ultimo_aporte_dividendo)
select 'CAPUCLA' as idempresa, CODIGO as codigo, CI as cedula, APELLIDOS as apellido, 
	NOMBRES as nombre, TIPO_AF as status_socio, PORC_RET as aporte_patron, 
	PORC_RET as aporte_socio, 0 as aporte_extra, 
	(select SALDO_ACTUAL 
		from SALDOS_MOVIMIENTOS, COD_MOVIMIENTOS 
		where SALDOS_MOVIMIENTOS.ID_AFILIADO = AFILIADOS.ID_AFILIADO 
			AND SALDOS_MOVIMIENTOS.ID_MOV=COD_MOVIMIENTOS.ID_MOV AND SIGNO='+' 
			AND TIPO_MOV = 'A' 
			AND DESCRIP_MOV = 'TOTAL APORTES DEL EMPLEADOR'
			ORDER BY SALDOS_MOVIMIENTOS.ID_MOV 
	) as haberes_patron, 
	(select SALDO_ACTUAL 
		from SALDOS_MOVIMIENTOS, COD_MOVIMIENTOS 
		where SALDOS_MOVIMIENTOS.ID_AFILIADO = AFILIADOS.ID_AFILIADO 
			AND SALDOS_MOVIMIENTOS.ID_MOV=COD_MOVIMIENTOS.ID_MOV AND SIGNO='+' 
			AND TIPO_MOV = 'A' 
			AND DESCRIP_MOV = 'TOTAL RETENCION ASOCIADO'
			ORDER BY SALDOS_MOVIMIENTOS.ID_MOV 
	) as haberes_socio, 
	(select SALDO_ACTUAL 
		from SALDOS_MOVIMIENTOS, COD_MOVIMIENTOS 
		where SALDOS_MOVIMIENTOS.ID_AFILIADO = AFILIADOS.ID_AFILIADO 
			AND SALDOS_MOVIMIENTOS.ID_MOV=COD_MOVIMIENTOS.ID_MOV AND SIGNO='+' 
			AND TIPO_MOV = 'A' 
			AND DESCRIP_MOV = 'EXCEDENTES'
			ORDER BY SALDOS_MOVIMIENTOS.ID_MOV 
	) as haberes_extra, 0 as  haberes_dividendo, 
	0 as haberes_opsu, 
	(select CIERRE_MES 
		from SALDOS_MOVIMIENTOS, COD_MOVIMIENTOS 
		where SALDOS_MOVIMIENTOS.ID_AFILIADO = AFILIADOS.ID_AFILIADO 
			AND SALDOS_MOVIMIENTOS.ID_MOV=COD_MOVIMIENTOS.ID_MOV AND SIGNO='+' 
			AND TIPO_MOV = 'A' 
			AND DESCRIP_MOV = 'TOTAL APORTES DEL EMPLEADOR'
			ORDER BY SALDOS_MOVIMIENTOS.ID_MOV 
	) as ultimo_aporte_patron, 
	(select CIERRE_MES 
		from SALDOS_MOVIMIENTOS, COD_MOVIMIENTOS 
		where SALDOS_MOVIMIENTOS.ID_AFILIADO = AFILIADOS.ID_AFILIADO 
			AND SALDOS_MOVIMIENTOS.ID_MOV=COD_MOVIMIENTOS.ID_MOV AND SIGNO='+' 
			AND TIPO_MOV = 'A' 
			AND DESCRIP_MOV = 'TOTAL RETENCION ASOCIADO'
			ORDER BY SALDOS_MOVIMIENTOS.ID_MOV 
	) as ultimo_aporte_socio, 
	(select CIERRE_MES 
		from SALDOS_MOVIMIENTOS, COD_MOVIMIENTOS 
		where SALDOS_MOVIMIENTOS.ID_AFILIADO = AFILIADOS.ID_AFILIADO 
			AND SALDOS_MOVIMIENTOS.ID_MOV=COD_MOVIMIENTOS.ID_MOV AND SIGNO='+' 
			AND TIPO_MOV = 'A' 
			AND DESCRIP_MOV = 'EXCEDENTES'
			ORDER BY SALDOS_MOVIMIENTOS.ID_MOV 
	) as ultimo_aporte_extra,
	NULL as ultimo_aporte_dividendo 
	from AFILIADOS ;

delete from prestamos_tipos where idempresa="CAPUCLA";
insert into prestamos_tipos (
	idempresa, codigo, descripcion, maximo_cuotas, interes, afecta_disponibilidad, descuento_semanal
	)
select 'CAPUCLA' as idempresa, cod_pres as codigo, descr_pres as descripcion, i_max_pres as interes, 
n_cuo_pres as maximo_cuotas, if(retab_pres=1,'Si','No') as afecta_disponibilidad, 
if(dcto_sem=1,'Si','No') as descuento_semanal
from heroscom_sicacap.sgcaf360 ;


delete from prestamos_socios where idempresa="CAPUCLA";
insert into prestamos_socios (
	idempresa, codigo_socio, cedula, 
    numero_prestamo, codigo_prestamo, fecha_solicitud, 
	fecha_1er_dcto, ultima_cuota_pagada, numero_de_cuotas, 
    monto_prestamo, monto_pagado,
	estatus_prestamo, cuota, interes, cuota_patron, 
    renovado, renovado_por,
	 paga_hasta
	)
select 'CAPUCLA' as idempresa, codsoc_sdp as codigo_socio, cedsoc_sdp as cedula,
nropre_sdp as numero_prestamo, codpre_sdp as codigo_prestamo, f_soli_sdp as fecha_solicitud, 
f_1cuo_sdp as fecha_1er_dcto, ultcan_sdp as ultima_cuota_pagada, nrocuotas as numero_de_cuotas, 
monpre_sdp as monto_prestamo, monpag_sdp as monto_pagado, 
if(stapre_sdp='A','A','C'), cuota, interes_sd as interes, cuota_ucla as cuota_patron, 
if(renovado=1,'Si','No'), renova_por as renovado_por, 
paga_hasta 
from heroscom_sicacap.sgcaf310 ;
