var pictureSource;
var destinationType;
var contadorFotos = 0;
var total_reg = 0;
var inicio;
var fin;
var limite = "";
var nav = 1;
var db;
//E V E N T O   L O A D
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    FastClick.attach(document.body);
    db = window.openDatabase("carofgod", "", "AUTOS PhoneGap", 200000);
    db.transaction(function (tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS AUTOS (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,\n\
     marca, modelo,dealer_price,condition_list,mileage,year_of_issue,vin,bodystyle,doors,engine,transmission,drive_line\n\
     ,fuel_type,exterior_color,city_mpg,hwy_mpg,interior_color,urlfoto,subido,nota,porEliminar INTEGER NOT NULL DEFAULT '0'\n\
    ,jrac_crop_x REAL,jrac_crop_y REAL,jrac_crop_width REAL,jrac_crop_height REAL,jrac_image_width REAL,jrac_image_height REAL,rotar INTEGER,escala INTEGER);");
    }, function (err) {
        console.error("Error al crear la tabla AUTOS =" + err.message);
    }, function () {
        console.log("Se creo correctamente la tabla AUTOS");
    });
    db.transaction(function (tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS AUTOS_CONFIG (id INTEGER NOT NULL PRIMARY KEY ,web,user,pass);");
        tx.executeSql('INSERT INTO AUTOS_CONFIG (id) VALUES (1);');
    }, function () {
        console.error("Error crear la tabla AUTOS_CONFIG");
    }, function () {
        console.log("Se creo correctamente la tabla AUTOS_CONFIG");
    }
    );
    db.transaction(function (tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS AUTOS_FOTOS (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,idAuto INTEGER,urlfoto,subido\n\
        ,jrac_crop_x REAL,jrac_crop_y REAL,jrac_crop_width REAL,jrac_crop_height REAL,jrac_image_width REAL,jrac_image_height REAL,rotar INTEGER,escala INTEGER);");
    }, function () {
        console.error("Error crear la tabla AUTOS_FOTOS");
    }, function () {
        console.log("Se creo correctamente la tabla AUTOS_FOTOS");
    });
    //CARGA LOS CAMPOS DE CONFIGURACION
    db.transaction(function (tx) {
        //SE SELECCIONAN LOS DATOS DE CONFIGURACION SIEMPRE Y CUANDO SEA 1 PORQUE SOLO HAY UN DATO DE CONFIGURACION
        var query_config = "SELECT * FROM AUTOS_CONFIG where id='1';";
        tx.executeSql(query_config, [], function (tx, rs) {
            var p = rs.rows.item(0);
            $("#web").val(p.web);
            $("#user").val(p.user);
            $("#pass").val(p.pass);
            //SI ESTA VACIA LA CONFIGURACION SE EJECUTA ABRIR LA CONFIGURACION
            if ($("#web").val().length <= 8 || $("#user").val().length == 0 || $("#pass").val().length == 0) {
                $("#botonConfig").click();
                //DEHABILITA LOS BOTONES HASTA QUE GUARDEN LOS DATOS DE CONFIGURACION
                habilitaBotones(false);
            } else {
                //HAY UN ERROR AL COLOCAR EL VAL VIA JQUERY ASI QUE SE TIENE QUE REMOVER LA CLASE EMPY CON ESTE SCRIPT
                $("#web").removeClass("empty");
                $("#user").removeClass("empty");
                $("#pass").removeClass("empty");
                //HABILITA LOS BOTONES PARA QUE PUEDAN CREAR AUTOS
                habilitaBotones(true);
            }
        }, function () {
            console.eror("NO SE PUEDO ABRIR EL AREA DE CONFIGURACION PORQUE NO SE ENCONTRO LA TABLA AUTOS_CONFIG");
            //COMO HUBO UN ERROR AL LEER LA TABLA "AUTOS_CONFIG" SE DESHABILITAN LOS BOTONES PARA CREAR AUTOS
            habilitaBotones(false);
            $("#botonConfig").click();
        }, function () {
            console.log("SE LEYO EXITOSAMENETE LA TABLA AUTOS_CONFIG");
        });
    }, function () {
        console.eror("NO SE PUDO REALIZAR LA TRANZACION DE LA LECTURA DE LA TABLA AUTOS_CONFIG");
    },function () {
        console.log("SE EJECUTO LA TRANSICION DE AUTOS_CONFIG");
    }
    );
    llena();
    pictureSource = navigator.camera.PictureSourceType;
    destinationType = navigator.camera.DestinationType;
}
function llenaAutocomplete() {
    $("#doors").autocomplete({source: ["2", "4", "5"]});
    $("#transmission").autocomplete({source: ["Manual", "Automatic", "Dual"]});
    $("#fuel_type").autocomplete({source: ["Gas", "Diesel", "Electric"]});
    $("#marca").autocomplete({source: ["Aston martin", "Audi", "Ford", "Bentley", "BMW", "Bugatti", "Chrysler Group LLC", "Ferrari", "Fiat", "Fomoco", "GM", "Honda", "Hyundai", "Jaguar Land Rover L", "Kia", "Lamborghini", "Maserati", "MAZDA", "McLaren Automotive ", "Mercedes-Benz", "Mitsubishi Motors Co", "Nissan", "Porsche", "Subaru", "Toyota", "Volkswagen", "Volvo"]});
}
function cargaPaginador() {
    var inicio = 0;
    var fin = 0;
    var total_reg = 0;
    db.transaction(function (tx) {
        var query = "SELECT * FROM AUTOS ORDER BY id DESC ;";
        tx.executeSql(query, [], function (tx, rs) {
            total_reg = rs.rows.length;
            //NUMERO DE PARTES EN LA QUE SE DIVIDE
            var div = 10;
            var partes = Math.ceil(total_reg / div);
            if (nav) {
                inicio = (div * nav) - div;
                fin = div * nav;
                limite = " LIMIT " + inicio + "," + div + " ";
            } else {
                nav = 1;
                limite = " LIMIT 0," + div + " ";
            }
            $("#paginador").html("");
            for (var i = 1; i < partes + 1; i++) {
                var active = "";
                if (i == nav) {
                    active = " active ";
                }
                $("#paginador").append("\n\
                <li><a href='#' class='nav " + active + "' paginador='" + i + "'>" + i + "</a></li>\n\
                ");
            }
        }, error);
    }, error, exito);
}
$(document).on("click", ".nav", function () {
    nav = $(this).attr("paginador");
    llena();
});

//BOTON CANCELAR
$(document).on("click", ".cancelConfig", function () {
    abrirPagina("#principal");
    $(".botonMenu").removeClass("active");
    $("#botonPrincipal").addClass("active");
});
$('.link').click(function () {
    var user = $("#user").val();
    var web = "http://" + $("#user").val() + ".carofgod.com";
    if (user.length > 0) {
        navigator.app.loadUrl(web, {openExternal: true});
    }
});

//G U A R D A    L A    C O N F I G U R A C I ON
$(document).on("click", "#editarConfig", function () {
    $.blockUI({message: "Wait..."});
    var correcto = true;
    //VALIDAMOS QUE ESTEN LLENOS LOS 3 CAMPOS
    $('#pageConfig input[type="text"].requerido,input[type="password"].requerido').each(function () {
        if ($(this).val() == '') {
            correcto = false;
            $(this).addClass('error');
        } else {
            $(this).removeClass('error');
        }
    });
    //MUSTRA MENSAJE QUE HAY CAMPOS VACIOS
    if (correcto == false) {
        floating("There are empty fields", 3000);
    }
    //AGREGAMOS AL CAMPO WEB EL "http://" SI NO LO TIENE
    var web = $("#web").val();
    if (web.slice(0, 7) != "http://") {
        $("#web").val("http://" + web);
    }
    web = $("#web").val();
    var regex = /^(ht|f)tps?:\/\/\w+([\.\-\w]+)?\.([a-z]{2,4}|travel)(:\d{2,5})?(\/.*)?$/i;
    //UNA VEZ CON EL HTTP VALIDAMOS QUE ESTE BIEN ESCRITO
    if (regex.test(web) == false) {
        correcto = false;
        floating("URL Web is wrong", 3000);
    }
    //SI SE VALIDO QUE TODOS LOS CAMPOS ESTAN LLENOS Y CORRECTOS SE PROCEDE A GUARDAR LA INFO Y MOSTRAR LA PAGINA PRINCIPAL
    if (correcto) {
        var requerimiento = $("#web").val() + "/components/com_login_ajax/login_remoto.php?username=" + $("#user").val() + "&passwd=" + $("#pass").val();
        //prompt(requerimiento,requerimiento);
        $.ajax({
            type: "GET",
            url: requerimiento,
            success: function (userJoomla) {
                var datosJoomla = userJoomla.split(',');
                var idUserJoomla = datosJoomla[0];
                var idUserSugar = datosJoomla[1];
                //SI EL LOGIN DE JOOMLA ES CORRECTO PROCEDEMOS
                if (idUserJoomla > 0 && idUserSugar.length > 0) {
                    var query = "UPDATE AUTOS_CONFIG SET web='" + $("#web").val() + "',user='" + $("#user").val() + "',pass='" + $("#pass").val() + "' where id='1';";
                    db.transaction(function (tx) {
                        tx.executeSql(query);
                    }, error, llena);
                    habilitaBotones(true);
                    $.unblockUI();
                    irPrincipal();
                    floating("Login Successful!", 3000);
                } else {
                    $.unblockUI();
                    floating("Error login!", 3000);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                $.unblockUI();
                window.scrollTo(0, 0);
                floating("Error server access result:" + xhr.status + " " + thrownError, 5000);
            }
        });
    } else {
        $.unblockUI();
        floating("Error login!", 5000);
        habilitaBotones(false);
    }
});
function habilitaBotones(siono) {
    //CAMBIA LOS VALORES DE TRUE A FALSE Y FALSE A TRUE PARA QUE DIGA habilitaBotones(true)
    if (siono){
        siono = false;
    }
    else{
        siono = true;
    }
    $("#botonPrincipal").prop('disabled', siono);
    $("#nuevo").prop('disabled', siono);
    //$("#abrirFuera").prop('disabled', siono);
    $(".link").prop('disabled', siono);
}
// A B R I R     N U E V O
$(document).on("click", "#nuevo", function () {
    //RESETEAMOS LA POSICION DE LA IMAGEN
    window.localStorage.setItem("jrac_crop_x", 0);
    window.localStorage.setItem("jrac_crop_y", 0);
    window.localStorage.setItem("jrac_crop_width", 0);
    window.localStorage.setItem("jrac_crop_height", 0);
    window.localStorage.setItem("jrac_image_width", 0);
    window.localStorage.setItem("jrac_image_height", 0);
    window.localStorage.setItem("rotar", 0);
    window.localStorage.setItem("escala", 0);
    window.localStorage.setItem("idEditar", 0);
    window.localStorage.setItem("urlfoto", "");
    window.localStorage.setItem("editar", 1);
    //HACEMOS UN RELOAD AL IFRAME "gillotina" PARA QUE CARGUE DE UNA IMAGEN VACIA
    document.getElementById('gillotina').contentWindow.location.reload();
    //ESCONDEMOS EL IFRAME gillotina
    $('#gillotina').hide();
    $("#titulodialog").text("Add");
    $(".texto").each(function (i) {
        $(".texto").val("");
    });
    $("#contenedorFoto").show();
    $("#urlfoto").hide();
    $("#agregar").show();
    $("#editar").hide();
});
function abrirPagina(pagina) {
    $(".page").removeClass("active").hide();
    $(".botonMenu").removeClass("active");
    $(pagina).show();
    $(pagina).addClass("active");
    $("#botonMenu").removeClass("active");
}
//G U A R D A R    N U E V O
$(document).on("click", "#agregar", function () {
    //INICIAMOS EL QUERY
    var query = "INSERT INTO AUTOS ";
    var campos = "(";
    var valores = "VALUES (";
    //SACAMOS TODOS LOS ELEMENTOS QUE SEAN TEXTO
    $(".texto").not("span").each(function (i) {
        var campo = $(this).attr("id");
        var valor = $(this).val();
        //campo=i+"-"+campo;
        if (i == 0) {
            campos = campos + campo + "\n";
            valores = valores + "'" + valor + "'\n";
        }
        if (i > 0) {
            campos = campos + "," + campo + "\n";
            valores = valores + ",'" + valor + "'\n";
        }
    });
    //VARIBLE PARA ALMACENAR LOS DATOS DE ROTAR DEL LA IMAGEN
    var actualizarRotarImagen = " '" + window.localStorage.getItem("jrac_image_height") + "' ";
    campos = campos + ",urlfoto                              ,rotar                                         ,escala                                         ,jrac_crop_x                                         ,jrac_crop_y                                         ,jrac_crop_width                                         ,jrac_crop_height                                         ,jrac_image_width                                         ,jrac_image_height)";
    valores = valores + ",'" + $("#urlfoto").attr("src") + "','" + window.localStorage.getItem("rotar") + "','" + window.localStorage.getItem("escala") + "','" + window.localStorage.getItem("jrac_crop_x") + "','" + window.localStorage.getItem("jrac_crop_y") + "','" + window.localStorage.getItem("jrac_crop_width") + "','" + window.localStorage.getItem("jrac_crop_height") + "','" + window.localStorage.getItem("jrac_image_width") + "','" + window.localStorage.getItem("jrac_image_height") + "')";
    query = query + campos + valores;
    //SI LOS CAMPOS required NO ESTAN LLENOS SE SALE
    if (camposRequeridos("#pageAgregar") == false) {
        return false;
    }
    db.transaction(function (tx) {
        $("#urlfoto").attr("src", "");
        console.log("queryInsert=" + query);
        tx.executeSql(query);
    }, error, llena);
    $(".texto").each(function (i) {
        $(".texto").val("");
    });
    irPrincipal();
    $("#contenedorFoto").show();
    $("#urlfoto").show();
});
// A B R I R     E D I T A R
$(document).on("change", ".sele", function () {
    if ($("option:selected", this).attr("class") != "botonEditar") {
        return false;
    }
    abrirPagina("#pageAgregar");
    $("#titulodialog").text("Edit");
    $("#contenedorFoto").show();
    $("#idEditar").val($("option:selected", this).attr("idEditar"));
    $("#agregar").hide();
    $("#editar").show();
    db.transaction(function (tx) {
        var query = "SELECT * FROM AUTOS where id='" + $("#idEditar").val() + "'  ORDER BY id DESC ;";
        //prompt(query,query);
        tx.executeSql(query, [], function (tx, rs) {
            var p = rs.rows.item(0);
            $("#marca").val(p.marca);
            $("#marca").removeClass("empty");
            $("#modelo").val(p.modelo);
            $("#modelo").removeClass("empty");
            $("#dealer_price").val(p.dealer_price);
            $("#dealer_price").removeClass("empty");
            $("#condition_list").val(p.condition_list);
            $("#condition_list").removeClass("empty");
            $("#mileage").val(p.mileage);
            $("#mileage").removeClass("empty");
            $("#year_of_issue").val(p.year_of_issue);
            $("#year_of_issue").removeClass("empty");
            $("#vin").val(p.vin);
            $("#vin").removeClass("empty");
            $("#bodystyle").val(p.bodystyle);
            $("#bodystyle").removeClass("empty");
            $("#doors").val(p.doors);
            $("#doors").removeClass("empty");
            $("#engine").val(p.engine);
            $("#engine").removeClass("empty");
            $("#transmission").val(p.transmission);
            $("#transmission").removeClass("empty");
            $("#drive_line").val(p.drive_line);
            $("#drive_line").removeClass("empty");
            $("#fuel_type").val(p.fuel_type);
            $("#fuel_type").removeClass("empty");
            $("#exterior_color").val(p.exterior_color);
            $("#exterior_color").removeClass("empty");
            $("#city_mpg").val(p.city_mpg);
            $("#city_mpg").removeClass("empty");
            $("#hwy_mpg").val(p.hwy_mpg);
            $("#hwy_mpg").removeClass("empty");
            $("#interior_color").val(p.interior_color);
            $("#interior_color").removeClass("empty");
            $("#nota").val(p.nota);
            $("#nota").removeClass("empty");
            $("#urlfoto").show();
            $("#urlfoto").attr("src", p.urlfoto);
            $("#subido").val(p.subido);
            window.localStorage.setItem("idEditar", $("#idEditar").val());
            window.localStorage.setItem("urlfoto", p.urlfoto);
            window.localStorage.setItem("jrac_crop_x", p.jrac_crop_x);
            window.localStorage.setItem("jrac_crop_y", p.jrac_crop_y);
            window.localStorage.setItem("jrac_crop_width", p.jrac_crop_width);
            window.localStorage.setItem("jrac_crop_height", p.jrac_crop_height);
            window.localStorage.setItem("jrac_image_width", p.jrac_image_width);
            window.localStorage.setItem("jrac_image_height", p.jrac_image_height);
            window.localStorage.setItem("rotar", p.rotar);
            window.localStorage.setItem("escala", p.escala);
            window.localStorage.setItem("editar", 1);
            document.getElementById('gillotina').contentWindow.location.reload();
        }, error);
    }, error, exito);
    $('.sele').val('1').trigger('change');
});
// A B R I R     VER
$(document).on("change", ".sele", function () {
    if ($("option:selected", this).attr("class") != "botonVer") {
        return false;
    }
    abrirPagina("#pageVer");
    $("#contenedorFoto").show();
    $("#idVer").val($("option:selected", this).attr("idVer"));
    db.transaction(function (tx) {
        var query = "SELECT * FROM AUTOS where id='" + $("#idVer").val() + "' ORDER BY id DESC ;";
        //prompt(query,query);
        tx.executeSql(query, [], function (tx, rs) {
            var p = rs.rows.item(0);
            $("#ver_marca").text(p.marca);
            $("#ver_modelo").text(p.modelo);
            $("#ver_dealer_price").text(p.dealer_price);
            $("#ver_condition_list").text(p.condition_list);
            $("#ver_mileage").text(p.mileage);
            $("#ver_year_of_issue").text(p.year_of_issue);
            $("#ver_vin").text(p.vin);
            $("#ver_bodystyle").text(p.bodystyle);
            $("#ver_doors").text(p.doors);
            $("#ver_engine").text(p.engine);
            $("#ver_transmission").text(p.transmission);
            $("#ver_drive_line").text(p.drive_line);
            $("#ver_fuel_type").text(p.fuel_type);
            $("#ver_exterior_color").text(p.exterior_color);
            $("#ver_city_mpg").text(p.city_mpg);
            $("#ver_hwy_mpg").text(p.hwy_mpg);
            $("#ver_interior_color").text(p.interior_color);
            $("#ver_nota").text(p.nota);
            window.localStorage.setItem("urlfoto", p.urlfoto);
            window.localStorage.setItem("jrac_crop_x", p.jrac_crop_x);
            window.localStorage.setItem("jrac_crop_y", p.jrac_crop_y);
            window.localStorage.setItem("jrac_crop_width", p.jrac_crop_width);
            window.localStorage.setItem("jrac_crop_height", p.jrac_crop_height);
            window.localStorage.setItem("jrac_image_width", p.jrac_image_width);
            window.localStorage.setItem("jrac_image_height", p.jrac_image_height);
            window.localStorage.setItem("rotar", p.rotar);
            window.localStorage.setItem("escala", p.escala);
            window.localStorage.setItem("editar", 0);
            document.getElementById('gillotina_ver_foto').contentWindow.location.reload();
            $("#ver_subido").text(p.subido);
            $("#photogallery").html("");
            db.transaction(function (tx) {
                var queryAutos = "SELECT * FROM AUTOS_FOTOS WHERE idAuto='" + $("#idVer").val() + "' ORDER BY id DESC ";
                //prompt(queryAutos,queryAutos);
                tx.executeSql(queryAutos, [], function (tx, rs) {
                    if (rs.rows.length) {
                        $("#photogallery").append('\
                            <div class="cont-mini">\n\
                                <img src="' + p.urlfoto + '" class="mini crm" >\n\
                            </div>\n\
                        ');
                    }
                    for (var i = 0; i < rs.rows.length; i++) {
                        var fotos = rs.rows.item(i);
                        $("#photogallery").append('\
                            <div class="cont-mini">\n\
                                <img src="' + fotos.urlfoto + '" class="mini crm" >\n\
                            </div>\n\
                        ');
                    }
                }, error);
            }, error, exito);
        }, error);
    }, error, exito);

    $('.sele').val('1').trigger('change');
});
$(document).on("click", ".mini", function () {
    $(".mini").removeClass("borde_mini");
    $(this).addClass("borde_mini");
    var mini = $(this);
    //$("#principal").attr("src",$(this).attr("src"));
    $("#ver_urlfoto").fadeOut(function () {
        $(this).attr("src", mini.attr("src")).fadeIn();
    });
});

//ABRIR AGREGAR EDITAR MAS FOTOS
$(document).on("change", ".sele", function () {
    if ($("option:selected", this).attr("class") != "botonMas") {
        return false;
    }
    idAuto = $("option:selected", this).attr("idMas");
    llenaFotos();
    //$.mobile.changePage('#pageMas', 'pop', true, true);
    abrirPagina('#pageMas');
    $('.sele').val('1').trigger('change');
});
//G U A R D A    E D I T A R
$(document).on("click", "#editar", function () {

    //SI LOS CAMPOS required NO ESTAN LLENOS SE SALE
    if (camposRequeridos("#pageAgregar") == false) {
        return false;
    }
    console.log("editar");
    //INICIAMOS EL QUERY
    var query = "UPDATE AUTOS SET ";
    var campos = "";
    //SACAMOS TODOS LOS ELEMENTOS QUE SEAN TEXTO
    $(".texto").not("span").each(function (i) {
        var campo = $(this).attr("id");
        var valor = $(this).val();
        //campo=i+"-"+campo;
        if (i == 0) {
            campos = campos + campo + "='" + valor + "' \n";
        }
        if (i > 0) {
            campos = campos + "," + campo + "='" + valor + "' \n";
        }
    });
    //VARIBLE PARA ALMACENAR LOS DATOS DE ROTAR DEL LA IMAGEN
    var actualizarRotarImagen = " rotar='" + window.localStorage.getItem("rotar") + "' ,escala='" + window.localStorage.getItem("escala") + "',jrac_crop_x='" + window.localStorage.getItem("jrac_crop_x") + "',jrac_crop_y='" + window.localStorage.getItem("jrac_crop_y") + "',jrac_crop_width='" + window.localStorage.getItem("jrac_crop_width") + "',jrac_crop_height='" + window.localStorage.getItem("jrac_crop_height") + "',jrac_image_width='" + window.localStorage.getItem("jrac_image_width") + "',jrac_image_height='" + window.localStorage.getItem("jrac_image_height") + "' ";
    campos = campos + ",urlfoto='" + $("#urlfoto").attr("src") + "'," + actualizarRotarImagen + "  where id='" + $("#idEditar").val() + "';";
    query = query + campos;
    db.transaction(function (tx) {
        console.log(query);
        tx.executeSql(query);
    }, error, llena);
    $(".page").removeClass("active").hide();
    $("#principal").show();
    $("#principal").addClass("active");
});
// B O R R A
$(document).on("change", ".sele", function () {
    if ($("option:selected", this).attr("class") != "botonBorrar") {
        return false;
    }
    //$.blockUI({message: "Wait..."});
    var idborrar = $("option:selected", this).attr("idborrar");
    var subido = $("#" + idborrar).attr("subido");
    if (navigator.network.connection.type == Connection.NONE) {
        var internet = 0;
    } else {
        var internet = 1;
    }
    if (internet == 0 && subido == 1) {
        floating("Note: An internet connection is required to removed this car.", 3000);
    } else {
        //URL PARA VALIDAR QUE EL USUARIO DE JOOMLA Y DE SUGAR ESTAN REGISTRADOS Y VALIDADOS
        var requerimiento = $("#web").val() + "/components/com_login_ajax/login_remoto.php?username=" + $("#user").val() + "&passwd=" + $("#pass").val();
        $.ajax({
            type: "GET",
            url: requerimiento,
            success: function (userJoomlaYsugar) {
                var datosJoomla = userJoomlaYsugar.split(',');
                var idUserJoomla = datosJoomla[0];
                var idUserSugar = datosJoomla[1];
                //SI EL LOGIN DE JOOMLA ES CORRECTO PROCEDEMOS
                if (idUserJoomla > 0 && idUserSugar.length > 0) {
                    //SACAMOS EL ID DEL AUTO CONCATENANDOO EL IDUSUARIO-SUGAR MAS EL ID DE ESTE AUTO
                    var id = idUserSugar.slice(0, 20) + idUserJoomla + idborrar + "-cel";
                    //URL PARA BORRAR UN AUTO
                    var requerimiento = $("#web").val() + "/components/com_login_ajax/guarda_auto_ajax.php?borrar_auto=" + id;
                    //prompt(requerimiento,requerimiento);
                    $.ajax({
                        type: "GET",
                        url: requerimiento,
                        success: function (res) {
                            var query = "DELETE FROM AUTOS where id='" + idborrar + "';";
                            db.transaction(function (tx) {
                                tx.executeSql(query);
                            }, error, llena);
                            $('.sele').val('1').trigger('change');
                            floating("Removed Successfully", 3000);
                            $.unblockUI();
                            //CAMBIA EL ESTADO DEL REGISTRO subido=1
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            floating("Error Removed", 3000);
                            $.unblockUI();
                        }
                    });
                }
            },
            //SE BORRA DE LOCAL PORQUE AUNQUE NO HAY INTERNET SE PUEDE BORRAR
            error: function (xhr, ajaxOptions, thrownError) {
                var query = "DELETE FROM AUTOS where id='" + idborrar + "';";
                db.transaction(function (tx) {
                    tx.executeSql(query);
                }, error, llena);
                $('.sele').val('1').trigger('change');
                floating("Removed Successful", 3000);
                $.unblockUI();
                //CAMBIA EL ESTADO DEL REGISTRO subido=1
            }
        });
    }
});
// B O R R A  FOTOS MULTIPLES
$(document).on("change", ".seleFotos", function () {
    if ($("option:selected", this).attr("class") != "botonBorrarFoto") {
        return false;
    }
    var idBorrar = $("option:selected", this).attr("idBorrar");
    var query = "DELETE FROM AUTOS_FOTOS where id=" + idBorrar + ";";
    db.transaction(function (tx) {
        tx.executeSql(query);
    }, error, llenaFotos);
    $('.seleFotos').val('1').trigger('change');
});
//T O M A R  LA    F O T O
$(document).on("click", "#tomarfoto", function () {
    if (device.platform == "Generic") {
        var imageURL = prompt("Url de su imagen", "http://i.imgur.com/JCadRVI.jpg");
        exitoTomaFoto(imageURL);
    } else {
        navigator.camera.getPicture(exitoTomaFoto, errorTomaFoto, {quality: 50});
    }
});
//S E L E C C I O N A    F O T O
$(document).on("click", "#selecfoto", function () {
    if (device.platform == "Generic") {
        var imageURL = prompt("Url de su imagen", "http://i.imgur.com/sZKpzbk.jpg");
        exitoTomaFoto(imageURL);
    } else {
        navigator.camera.getPicture(exitoTomaFoto, errorTomaFoto, {quality: 50, destinationType: destinationType.FILE_URI, sourceType: pictureSource.SAVEDPHOTOALBUM});
    }
});
//T O M A R  LA    F O T O DINAMICA
$(document).on("click", "#agregarFotoDina", function () {
    if (device.platform == "Generic") {
        var imageURL = prompt("Url de su imagen", "http://i.imgur.com/sZKpzbk.jpg");
        exitoTomaFotoDinamica(imageURL);
    } else {
        navigator.camera.getPicture(exitoTomaFotoDinamica, errorTomaFoto, {quality: 50});
    }
});
//S E L E C C I O N A    F O T O   DINAMICA
$(document).on("click", "#selecFotoDina", function () {
    if (device.platform == "Generic") {
        var imageURL = prompt("Url de su imagen", "http://i.imgur.com/sZKpzbk.jpg");
        exitoTomaFotoDinamica(imageURL);
    } else {
        navigator.camera.getPicture(exitoTomaFotoDinamica, errorTomaFoto, {quality: 50, destinationType: destinationType.FILE_URI, sourceType: pictureSource.SAVEDPHOTOALBUM});
    }
});

//A B R I R    L A    C O N F I G U R A C I ON
$(document).on("click", "#config", function () {
    db.transaction(function (tx) {
        var query = "SELECT * FROM AUTOS_CONFIG where id='1';";
        tx.executeSql(query, [], function (tx, rs) {
            for (var i = 0; i < rs.rows.length; i++) {
                var p = rs.rows.item(i);
                $("#web").val(p.web);
                $("#user").val(p.user);
                $("#pass").val(p.pass);
            }
        }, error);
    }, error, exito);
});
//SUBIR AUTO
$(document).on("change", ".sele", function botonSubirPrincipal() {
    if ($("option:selected", this).attr("class") != "botonSubir") {
        return false;
    }
    var idsubir = $("option:selected", this).attr("idsubir");
    var query = "SELECT * FROM AUTOS where id='" + idsubir + "' ORDER BY id DESC ;";
    $.blockUI({css: {border: 'none', padding: '15px', backgroundColor: '#000', '-webkit-border-radius': '10px', '-moz-border-radius': '10px', opacity: .5, color: '#fff'}});
    db.transaction(function (tx) {
        tx.executeSql(query, [], function (tx, rs) {
            var p = rs.rows.item(0);
            var marca = p.marca;
            var modelo = p.modelo;
            var dealer_price = p.dealer_price;
            var condition_list = p.condition_list;
            var mileage = p.mileage;
            var year_of_issue = p.year_of_issue;
            var vin = p.vin;
            var bodystyle = p.bodystyle;
            var doors = p.doors;
            var engine = p.engine;
            var transmission = p.transmission;
            var drive_line = p.drive_line;
            var fuel_type = p.fuel_type;
            var exterior_color = p.exterior_color;
            var city_mpg = p.city_mpg;
            var hwy_mpg = p.hwy_mpg;
            var interior_color = p.interior_color;
            var nota = p.nota;
            var urlfoto = p.urlfoto;
            //URL PARA OBTENER EL 0= ID JOOMLA Y EL 0= ID SUGAR
            var requerimiento = $("#web").val() + "/components/com_login_ajax/login_remoto.php?username=" + $("#user").val() + "&passwd=" + $("#pass").val();
            //prompt(requerimiento,requerimiento);
            $.ajax({
                type: "GET",
                url: requerimiento,
                success: function (userJoomla) {
                    var datosJoomla = userJoomla.split(',');
                    var idUserJoomla = datosJoomla[0];
                    var idUserSugar = datosJoomla[1];
                    //SI EL LOGIN DE JOOMLA ES CORRECTO PROCEDEMOS
                    if (idUserJoomla > 0 && idUserSugar.length > 0) {
                        //SACAMOS EL ID DEL AUTO CONCATENANDOO EL IDUSUARIO-SUGAR MAS EL ID DE ESTE AUTO
                        var id = idUserSugar.slice(0, 20) + idUserJoomla + idsubir + "-cel";
                        // /*
                        //SUBIR FOTO
                        var options = new FileUploadOptions(), params = new Object;
                        options.fileKey = "file";
                        options.fileName = id;
                        options.mimeType = "image/jpeg";
                        params.value1 = "test";
                        params.value2 = "param";
                        options.params = params;
                        options.chunkedMode = false;
                        options.headers = {
                            Connection: "close"
                        };
                        var ft = new FileTransfer();
                        ft.upload(urlfoto, $("#web").val() + "/crm/recibefoto.php?jrac_crop_x=" + p.jrac_crop_x + "&jrac_crop_y=" + p.jrac_crop_y + "&jrac_crop_width=" + p.jrac_crop_width + "&jrac_crop_height=" + p.jrac_crop_height + "&jrac_image_width=" + p.jrac_image_width + "&jrac_image_height=" + p.jrac_image_height + "&rotar=" + p.rotar + "&escala=" + p.escala,
                                function () {
                                    //URL PARA INSERTAR DATOS DEL CARRO
                                    var requerimiento = $("#web").val() + "/components/com_login_ajax/guarda_auto_ajax.php?id=" + id + "&modified_user_id=" + idUserSugar + "&created_by=" + idUserSugar + "&assigned_user_id=" + idUserSugar + "&filename=" + id + "&maker=" + marca + "&model=" + modelo + "&dealer_price=" + dealer_price + "&mileage=" + mileage + "&condition_list=" + condition_list + "&year_of_issue=" + year_of_issue + "&vin=" + vin + "&bodystyle=" + bodystyle + "&doors=" + doors + "&engine=" + engine + "&transmission=" + transmission + "&drive_line=" + drive_line + "&fuel_type=" + fuel_type + "&exterior_color=" + exterior_color + "&city_mpg=" + city_mpg + "&hwy_mpg=" + hwy_mpg + "&interior_color=" + interior_color + "&userjoomla=" + idUserJoomla;
                                    console.log("requerimiento="+requerimiento);
                                    //prompt(requerimiento,requerimiento);
                                    $.ajax({
                                        type: "GET",
                                        url: requerimiento,
                                        success: function (res) {
                                            $.unblockUI();
                                            //SUBIMOS LA FOTO DEL AUTO , MANDAMOS LAurlfoto=UBICACION DE LA FOTON EL EL CEL Y EL id=NOMBRE DE LA FOTO EN LA WEB CON EL QUE SE VA A GURADAR EN LA WEB
                                            floating("Upload Successful", 3000);
                                            //CAMBIA EL ESTADO DEL REGISTRO subido=1
                                            subido(idsubir);
                                        },
                                        error: function (xhr, ajaxOptions, thrownError) {
                                            floating("Error image information", 3000);
                                            $.unblockUI();
                                        }
                                    });
                                    
                                },
                                function (err) {
                                    $.unblockUI();
                                    floating("Error upload image, error code: " + err.code, 3000);
                                },
                                options);
                        // */
                    } else {
                        $.unblockUI();
                        floating("Login error", 3000);
                        $("#botonConfig").click();
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    $.unblockUI();
                    floating("Error user authenticated =" + xhr + "---" + ajaxOptions + "---" + thrownError, 3000);
                }
            });


        }, error);
        $('.sele').val('1').trigger('change');
    }, error, exito);
});
//SUBIR FOTO
$(document).on("change", ".seleFotos", function botonSubirMiniatura () {
    if ($("option:selected", this).attr("class") != "botonSubirFoto") {
        return false;
    }
    //TOMAMOS EL ID DE ESTA IMAGEN
    var idsubir=$("option:selected", this).attr("idsubir");
    //TOMAMOS LA URL DE LA FOTO QUE TAMBIEN SE GURDO EN EL SELECT seleFotos
    var urlImg = $(this).attr("urlImg");
    //window.alert("urlImg="+urlImg);
    //TOMAMOS EL ID DE LA FOTO PADRE PARA VINCULARLO CON LA FOTO HIJO
    var idPadre = $(this).attr("idPadre");
    //TOMAMOS LE ID AUTONUMERICO DE ESTA FOTO
    var idFoto = $(this).attr("idFoto");
    //INICIAMOS EL MENSAJE DE SUBIENDO
    $.blockUI({css: {border: 'none', padding: '15px', backgroundColor: '#000', '-webkit-border-radius': '10px', '-moz-border-radius': '10px', opacity: .5, color: '#fff'}});
    //URL PARA OBTENER EL 0= ID JOOMLA Y EL 0= ID SUGAR
    var requerimiento = $("#web").val() + "/components/com_login_ajax/login_remoto.php?username=" + $("#user").val() + "&passwd=" + $("#pass").val();
    //prompt(requerimiento,requerimiento);
    $.ajax({
        type: "GET",
        url: requerimiento,
        success: function (userJoomla) {
            //OBTENEMOS 2 DATOS idUserJoomla,idUserSugar DIVIDIDOS POR COMA Y A ESTOS LOS SEPARAMOS CON LA FUNCION split
            var datosJoomla = userJoomla.split(',');
            var idUserJoomla = datosJoomla[0];
            var idUserSugar = datosJoomla[1];
            //SI EL LOGIN DE JOOMLA ES CORRECTO PROCEDEMOS
            if (idUserJoomla > 0) {
                //CREAMOS EL ID DEL AUTO CONCATENANDOO EL IDUSUARIO-SUGAR MAS EL ID DE ESTE AUTO
                idFoto = idUserSugar.slice(0, 20) + idUserJoomla + idPadre + idFoto + "-cel";
                //CREAMOS EL ID DEL PADRE
                idPadre = idUserSugar.slice(0, 20) + idUserJoomla + idPadre + "-cel";
                //INICIALIZAMOS LOS PARAMETROS PARA SUBIR FOTO
                var options = new FileUploadOptions(), params = new Object;
                options.fileKey = "file";
                options.fileName = idFoto;
                options.mimeType = "image/jpeg";
                params.value1 = "test";
                params.value2 = "param";
                options.params = params;
                options.chunkedMode = false;
                options.headers = {
                    Connection: "close"
                };
                var ft = new FileTransfer();
                //URL PARA INSERTAR DATOS DEL CARRO
                var requerimiento = $("#web").val() + "/components/com_login_ajax/guarda_foto_ajax.php?id=" + idFoto + "&modified_user_id=" + idUserSugar + "&created_by=" + idUserSugar + "&assigned_user_id=" + idUserSugar + "&filename=" + idFoto + "&idPadre=" + idPadre;
                //CREAMOS UNA CADENA SUSTITULLENDO LOS & POR | POERQUE ESTA CADENA LA VAMOS A MANDAR POR MAIL PARA SABER COMO FUNCIONA ESTA CADENA
                //var requerimiento2 = $("#web").val() + "/components/com_login_ajax/guarda_foto_ajax.php?id=" + idFoto + "|modified_user_id=" + idUserSugar + "|created_by=" + idUserSugar + "|assigned_user_id=" + idUserSugar + "|filename=" + idFoto + "|idPadre=" + idPadre;
                //window.location.href="mailto:eucm2@hotmail.com?subject="+requerimiento2+"&body="+requerimiento2;
                //COMENZAMOS A SUBIR LA IMAGEN AL SERVIDOR
                //crm/recibefoto.php?jrac_crop_x=" + p.jrac_crop_x + "&jrac_crop_y=" + p.jrac_crop_y + "&jrac_crop_width=" + p.jrac_crop_width + "&jrac_crop_height=" + p.jrac_crop_height + "&jrac_image_width=" + p.jrac_image_width + "&jrac_image_height=" + p.jrac_image_height + "&rotar=" + p.rotar + "&escala=" + p.escala
                var queryAutosFotos="SELECT * FROM AUTOS_FOTOS  where id='"+idsubir+"';";
                console.log(queryAutosFotos);
                db.transaction(function (tx) {
                    tx.executeSql(queryAutosFotos, [], function (tx, rs) {
                        var p = rs.rows.item(0);
                        var urlRecibeFoto = $("#web").val() + "/crm/recibefoto.php?jrac_crop_x=" + p.jrac_crop_x + "&jrac_crop_y=" + p.jrac_crop_y + "&jrac_crop_width=" + p.jrac_crop_width + "&jrac_crop_height=" + p.jrac_crop_height + "&jrac_image_width=" + p.jrac_image_width + "&jrac_image_height=" + p.jrac_image_height + "&rotar=" + p.rotar + "&escala=" + p.escala;
                        //console.log(urlRecibeFoto);
                        ft.upload(urlImg, urlRecibeFoto, function () {
                            $.ajax({
                                type: "GET",
                                url: requerimiento,
                                success: function (res) {
                                    $.unblockUI();
                                    //SUBIMOS LA FOTO DEL AUTO , MANDAMOS LAurlfoto=UBICACION DE LA FOTON EL EL CEL Y EL id=NOMBRE DE LA FOTO EN LA WEB CON EL QUE SE VA A GURADAR EN LA WEB
                                    floating("Image uploaded successfully!", 3000);
                                    //CAMBIA EL ESTADO DEL REGISTRO subido=1
                                    //subido(idsubir);
                                },
                                error: function (xhr, ajaxOptions, thrownError) {
                                    floating("Error save information " + thrownError, 3000);
                                    $.unblockUI();
                                }
                            });
                        }, function (err) {
                            $.unblockUI();
                            floating('Error upload image, error code: ' + err.code, 3000);
                            //console.log('error al subir la imagen, error code: ' + err.code);
                        }, options);

                    }, error);
                }, error, exito);
            } else {
                $.unblockUI();
                floating("Login error", 3000);
                $("#botonConfig").click();
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            $.unblockUI();
            floating("User authentication error or conexion server missing =" + xhr + "---" + ajaxOptions + "---" + thrownError, 3000);
        }
    });
    $('.seleFotos').val('1').trigger('change');
});
//AL TOMAR LA FOTO SE COLOCA EN LA IMG Y SE HIDE LOS BOTONES
function exitoTomaFoto(imageURL) {
    window.localStorage.setItem("jrac_crop_x", 0);
    window.localStorage.setItem("jrac_crop_y", 0);
    window.localStorage.setItem("jrac_crop_width", 0);
    window.localStorage.setItem("jrac_crop_height", 0);
    window.localStorage.setItem("jrac_image_width", 0);
    window.localStorage.setItem("jrac_image_height", 0);
    window.localStorage.setItem("rotar", 0);
    window.localStorage.setItem("escala", 0);
    window.localStorage.setItem("urlfoto", imageURL);
    window.localStorage.setItem("editar", 1);
    document.getElementById('gillotina').contentWindow.location.reload();
    $("#urlfoto").attr("src", imageURL);
    $("#urlfoto").show();
    $("#contenedorFoto").hide();
    $("#gillotina").show("slow");
}
//AL TOMAR LA FOTO SE COLOCA EN LA IMAGEN QUE CORRESPONDA
function exitoTomaFotoDinamica(imageURL) {
    //INICIAMOS EL QUERY
    var query = "INSERT INTO AUTOS_FOTOS (idAuto,urlfoto,subido) VALUES (" + idAuto + ",'" + imageURL + "',0); ";
    //prompt(query, query);
    db.transaction(function (tx) {
        tx.executeSql(query);
    }, error, llenaFotos);
}
//MENSAJE ERROR AL TOMAR LA FOTO
function errorTomaFoto(message) {
    console.log('Error tomar foto porque : ' + message);
}
// M U E S T R A     E R R O R
function error(err) {
    console.log("Error procesando SQL: " + err.code);
}
// M U E S T R A     E R R O R
function error_crear_tabla(err) {
    console.log("Error procesando SQL: " + err.code);
}
// M E N S A JE   D E   E X I T O
function exito() {
    console.log("Correcta ejecucion bd");
}
// L L E N A    L A   L I S T A
function llena(tx) {
    cargaPaginador();
    $('#lista').empty();
    db.transaction(function (tx) {
        var query = "SELECT * FROM AUTOS  ORDER BY id DESC  " + limite + " ";
        //prompt(query,query);
        tx.executeSql(query, [], function (tx, rs) {
            for (var i = 0; i < rs.rows.length; i++) {
                var p = rs.rows.item(i);
                var subidoClass = "";
                var subidoMensaje = "";
                if (p.subido == 1) {
                    subidoClass = ' class="ui-bar-b li-lista" subido="1" ';
                    subidoMensaje = '  ';
                } else {
                    subidoClass = ' class="li-lista" subido="0"  ';
                    subidoMensaje = ' <span class="question" original-title="Important: This car is not LIVE on your website, Please select Action >Upload to finish the process."> ! </span> ';
                }
                $("#lista").append('\
        <li id="' + p.id + '" ' + subidoClass + ' >\n\
          <div class="ui-grid-a" >\n\
            <div class="left-li ui-block-a auto-texto">\n\
              ' + subidoMensaje + '<span>' + p.marca + ' ' + p.modelo + '</span>\n\
            </div>\n\
            <div class="right-li ui-block-b">\n\
              <select data-transition="none" class="sele">\n\
                <option value="1">Action</option>\n\
                <option value="2" class="botonSubir" idSubir="' + p.id + '">Upload</option>\n\
                <option value="3" class="botonEditar" idEditar="' + p.id + '">Edit</option>\n\
                <option value="4" class="botonVer" idVer="' + p.id + '">View</option>\n\
                <option value="5" class="botonMas" idMas="' + p.id + '">Additional Images</option>\n\
                <option value="6" class="botonBorrar" idBorrar="' + p.id + '">Delete</option>\n\
              </select>\n\
            </div>\n\
          </div>\n\
        </li>');
            }
            //ACTIVAR LA FUNCION DE TOLTIPO
            $('.question').tipsy({gravity: 'sw'});
        }, error);
    }, error, exito);
}
// LLENA FOTOS
function llenaFotos(tx, results) {
    $('#listafotos').empty();
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM AUTOS_FOTOS WHERE idAuto='" + idAuto + "'", [], function (tx, rs) {
            for (var i = 0; i < rs.rows.length; i++) {
                var p = rs.rows.item(i);
                var subido = "";
                if (p.subido == 1) {
                    subido = ' class="ui-bar-b" ';
                } else {
                    subido = ' ';
                }
                $("#listafotos").append('\
                <li id="--' + p.id + '" ' + subido + ' >\n\
                  <div class="ui-grid-a" style="border: 1px solid black;margin-bottom: 2px;" >\n\
                    <div>\n\
                      <iframe src="guillotina/editar.html?id=' + p.id + '" style="height:400px; width:100%;" frameborder="0" ></iframe>\n\
                    </div>\n\
                    <div style="width: 100%;text-align: center;margin-bottom: 20px;"> \n\
                      <select data-transition="none" class="seleFotos" urlImg="' + p.urlfoto + '" idPadre="' + idAuto + '" idFoto="' + p.id + '" style="width: 50%;" >\n\
                        <option value="1">Action</option>\n\
                        <option value="2" class="botonSubirFoto" idSubir="' + p.id + '">Upload</option>\n\
                        <option value="4" class="botonBorrarFoto" idBorrar="' + p.id + '">Delete</option>\n\
                      </select>\n\
                    </div>\n\
                  </div>\n\
                </li>');
            }
        }, error);
    }, error, exito);
}
function subido(idsubir) {
    db.transaction(function (tx) {
        tx.executeSql("UPDATE AUTOS SET subido='1' WHERE id='" + idsubir + "';");
        $("#" + idsubir).addClass("ui-bar-b");
        $("#" + idsubir).find(".question").remove();
    }, error, exito);
}

function camposRequeridos(area) {
    var correcto = true;
    $(area + ' input[type="text"].requerido').each(function () {
        if ($(this).val() == '') {
            correcto = false;
            $(this).addClass('error');
        } else {
            $(this).removeClass('error');
        }
    });
    $(area + ' input[type="number"].requerido').each(function () {
        if ($(this).val() == '') {
            correcto = false;
            $(this).addClass('error');
        } else {
            $(this).removeClass('error');
        }
    });
    $(area + ' input[type="tel"].requerido').each(function () {
        if ($(this).val() == '') {
            correcto = false;
            $(this).addClass('error');
        } else {
            $(this).removeClass('error');
        }
    });
    $(area + ' select.requerido').each(function () {
        if ($(this).val() == '') {
            correcto = false;
            $(this).addClass('error');
        } else {
            $(this).removeClass('error');
        }
    });
    //SI HAY IMAGEN CONTENIDA ROMEVEMOS BORDE RORJO DE ERROR
    if (window.localStorage.getItem("urlfoto")) {
        $("#contenedorFoto").removeClass('error');
    }
    //SI NO HAY IMAGEN MUESTRA EL ERROR Y COLOCA LA VARIABLE DE CORRECTO COMO FALSA
    else {
        correcto = false;
        $("#contenedorFoto").addClass('error');
    }
    /*
     if ($("#urlfoto").is(":hidden")) {
     correcto = false;
     $("#contenedorFoto").addClass('error');
     } else {
     $("#contenedorFoto").removeClass('error');
     }
     if (correcto == false) {
     window.scrollTo(0, 0);
     floating("There are empty fields", 3000);
     }
     */
    return correcto;
}
function abrirAgregar() {
    $.mobile.changePage('#pageAgregar', 'pop', true, true);
}
//FUNCION PARA IR A LA VENTANA PRINCIPAL
function irPrincipal() {
    $(".page").removeClass("active").hide();
    $(".botonMenu").removeClass("active");
    $("#principal").show();
    $("#principal").addClass("active");
    $("#botonPrincipal").addClass("active");
}

$(document).on("keypress", "#buscadorListas", function () {
    $('#lista').liveFilter('#buscadorListas', '.li-lista');
});
$(document).ready(function () {
    //LLENOSMOS LOS CAMPOS CON AUTOCOMPLETE COMO MARCA,FUEL_TYPE
    llenaAutocomplete();
    //CLICK EN LOS BOTONES DEL MENU SE MUESTRAN ACTIVOS Y SE MUETSRAN LAS PAGINAS
    $(".botonMenu").click(function () {
        // Menu
        if (!$(this).data("target"))
            return;
        if ($(this).is(".active"))
            return;
        $("button").not($(this)).removeClass("active");
        $(".page").not(page).removeClass("active").hide();
        window.page = $(this).data("target");
        var page = $(window.page);
        window.location.hash = window.page;
        $(this).addClass("active");
        page.show();

        var totop = setInterval(function () {
            $(".pages").animate({scrollTop: 0}, 0);
        }, 1);

        setTimeout(function () {
            page.addClass("active");
            setTimeout(function () {
                clearInterval(totop);
            }, 1000);
        }, 100);

    });
});

function floating(mensaje, tiempo) {
    del = $.floatingMessage(mensaje, {
        position: "top-right",
        height: 45
    });
    setTimeout(function () {
        del.floatingMessage("destroy");
    }, tiempo);
}

$(document).on("click", "#cancelar_rotar", function () {
    abrirPagina("#principal");
    $(".botonMenu").removeClass("active");
    $("#botonPrincipal").addClass("active");
});
$(document).on("click", "#boton_editar", function () {
    window.location.replace("guillotina/index.html");
});
