<?php 
/*
  Archivo *: header.php
 *
  archivo que contine el menu inicial de la apliacion.
 *
  Archivos Requeridos
  includes/Session.php
  includes/Data_Paciente.php
 *
 */ 

?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
        <meta name="viewport" content="width=device-width" />
        <meta property="og:url"           content="http://redmedix.com" />
	<meta property="og:type"          content="Citas Medicas" />
	<meta property="og:title"         content="Redmedix" />
	<meta property="og:description"   content="Plataforma web la cual gestiona el proceso de asignacion de citas medicas." />
	<meta property="og:image"         content="http://consorciofibra2012.com/CitasMedicas/images/logo.png" />
        <title>Redmedix</title>
        <script src="//code.jquery.com/jquery-1.12.3.js"></script>
        <script src="//code.jquery.com/jquery-migrate-1.0.0.js"></script>
        <script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
        <link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.12/css/jquery.dataTables.css"> 
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" />
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css" />
        <link href="css/facebox.css" media="screen" rel="stylesheet" type="text/css" />
        <link rel="stylesheet" href="css/style.css" type="text/css" media="print, projection, screen" />
        <link rel="stylesheet" href="css/reset.css" type="text/css" />
        <link rel="stylesheet" href="css/bootstrap-social.css" type="text/css" />
        <link rel="stylesheet" href="css/font-awesome.css" type="text/css" />
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>
        <script type="text/javascript" src="js/tooltip.js"></script> 
        <script type="text/javascript" src="js/tablesorter.js"></script>
        <!--<script type="text/javascript" src="js/tablesorter-pager.js"></script>-->
        <script type="text/javascript" src="js/jquery.tablesorter.pager.js"></script>
        <script type="text/javascript" src="js/bootstrap-dialog.js"></script>
        <script type="text/javascript" src="js/jquery.bootpag.js"></script>
        <script type="text/javascript" src="js/jquery.dataTables.js"></script>
        <script type="text/javascript" src="js/cookie.js"></script>
        <script type="text/javascript" src="js/custom.js"></script>
        <script src="js/facebox.js" type="text/javascript"></script>
        <script src="js/sha2.js" type="text/javascript"></script>
        <script src="js/jquery.validate.min.js" type="text/javascript"></script>
        <script src="js/fb_connect.js" type="text/javascript"></script>
        <script type="text/javascript">
        
            function verLink( a, b ){
                BootstrapDialog.confirm('Esta saliendo de la zona segura del portal REDMEDIX, esta seguro de esta acci&oacute;n.', function(result){
                    if( result ) {
                        $.post('salir.php', function(){
                            if ( b === 1){
                                location.href="index.php#"+a;
                            }else {
                                location.href= a+".php";
                            }
                        });
                    }else {
                        return false;
                    }
                });
            }
            
            $(document).ready(function() {
                $('a[rel*=facebox]').facebox({
                    loadingImage : 'loading.gif',
                    closeImage   : 'closelabel.png'
                });

                $.widget( "custom.catcomplete", $.ui.autocomplete, {
                    _create: function() {
                        this._super();
                        this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
                    },
                    _renderMenu: function( ul, items ) {
                        var that = this,
                            currentCategory = "";
                        $.each( items, function( i, item ) {
                            var li;
                            if ( item.categoria !== currentCategory ) {
                                ul.attr("data-role","listview");
                                ul.attr("data-inset","true");
                                ul.append( "<li data-role='list-divider' aria-label='"+item.nombre+"' class='ui-autocomplete-item'><a href='"+(item.categoria).toLowerCase()+".php?q="+item.query+"'><div class='info-"+item.categoria+" ui-grid-solo ui-group-theme-c' >Mostrar lista de <h4 style='color:green;display:inline;'>" + item.categoria + "</h4></div></a></li>" );
                                currentCategory = item.categoria;
                            }
                            li = that._renderItemData( ul, item ); 
                            if ( item.categoria ) {
                                li.attr( "aria-label", item.categoria + " : " + item.nombre );
                            }
                        });
                    },
                    _renderItemData: function( ul, item ) {
                        return this._renderItem( ul, item ).data( "ui-autocomplete-item", item );
                    },

                    _renderItem: function( ul, item ){
                        return $( "<li>" )
                            .append( $( "<a class='btn_ver' href='"+(item.categoria).toLowerCase()+".php?id="+item.id+"'>" )
                                .append( $( "<div class='col-xs-12' >" )
                                    .append( $( "<div class='img-"+item.categoria+" col-xs-2' >" )
                                        .append( $( "<img class='img-"+item.categoria+"' width='64' src='images/perfil/"+item.img+"'>" ))
                                    )
                                    .append( $( "<div class='col-xs-10' >" )
                                        .append( $( "<div class='info-"+item.categoria+" col-xs-4' >" ).html( item.nombre ))
                                        .append( $( "<div class='cat-"+item.categoria+" col-xs-4' >" ).html( item.especialidad ))
                                        .append( $( "<div class='lgr-"+item.categoria+" col-xs-4' >" ).html( item.ciudad ))
                                    )
                                )
                            )
                            .appendTo( ul );
                    }
                });

                $( "#buscador" ).catcomplete({
                    source: function( request, responseFn ) {
                        $.getJSON("buscador.php?term=" + request.term, function (data) {
                            responseFn(data, function () {
                                var a;
                                var re = $.ui.autocomplete.escapeRegex(request.term);
                                var matcher = new RegExp( "/"+re+"*/", "i" );
                                $.each( data, function(value, i){
                                    a = $.grep(value, function(val){
                                        return matcher.test(val.nombre) 
                                            || matcher.test(val.categoria)
                                            || matcher.test(val.actividad)
                                            || matcher.test(val.especialidad)
                                            || matcher.test(val.ciudad);
                                    });
                                });
                                return a;
                            });
                        });
                    }
                });
                $("#pager").hide();
            });
                
        </script>
        <link rel="stylesheet" href="css/ajax-poller.css" type="text/css" />
        <link href="css/facebox.css" media="screen" rel="stylesheet" type="text/css" />
    </head>
<body>
    <nav class="navbar menu_home3 navbar-fixed-top">
        <div class="container-fluid">
            <div class="navbar-header" id="navbarmenu">
                <button type="button" id="btn_mobile" class="navbar-toggle float-right" data-toggle="collapse" data-target="#menu" aria-expanded="false">
                    <span class="sr-only">Menu</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <?if( !empty($_SESSION) && $_SESSION["rol"] != "" ){?>
                    <a class="navbar-brand" href="index2.php" style="padding-top: 0px;"><img src="images/logo.png" width="100%" alt="logo" /></a>
                <?}else{?>
                    <a class="navbar-brand" href="index.php" style="padding-top: 0px;"><img src="images/logo.png" width="100%" alt="logo" /></a>
                <?}?>
            </div>
            <div class="col-xs-12 col-sm-7 col-md-7">
                <form id="form_busqueda">
                    <div class="input-group" style="border: 1px solid #F7931E;">
                        <input type="text" id="buscador" name="buscador" class="form-control input-lg" placeholder="Busqueda por palabra de especialista o enfermedad o nombre del Profesional o ciudad o centro m&eacute;dico o laboratorio..." />
                        <span class="input-group-btn block-center">
                            <a class="btn-search"><img src="images/search.png" width="40%" /></a>
                        </span>
                    </div>
                </form>
            </div>
            <div class="collapse navbar-collapse" id="menu">
                <ul class="nav navbar-nav navbar-right">
                    <?if( !empty($_SESSION) && $_SESSION["rol"] != "" ){
                        $nom = 
                            '<li style="float:right;line-height:0.8em;text-align:right;">
                                <span>Conectado como <span>'.$_SESSION["nombre"].'</span></span>
                                <br class="clearfix"/>
                                <br class="clearfix"/>
                                <span><a href="perfil-usuario.php">Ver Perfil</a></span>
                            </li>
                            <br class="clearfix" />  
                            <li style="line-height:2.4em; width: 100%; text-align: right;">
                                <span><a style="height:1px;width:50%;display:inline;" href="logout.php" title="Desconectarse">Salir</a></span>
                            </li>';                            
                    }else{
                        $nom = '<li style="line-height:1em;float:right;"><div class="options-side"><span>Bienvenido a RedMedix</span></div></li>';
                    }
                    echo $nom;
                    ?>
                </ul>
            </div>
        </div> 
    </nav>