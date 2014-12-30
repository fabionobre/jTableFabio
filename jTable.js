(function($) {

	$.fn.jTable = function(settings) {

		settings = $.extend({
			mensagem : 'msg_padrao',
			parametros : {},
			opcoes : [],
			opcoesWidth : '80px',
			mensagemEmpty: 'Nenhum dado encontrado',
			mensagemCarregando: 'Carregando',
			async: true
		}, settings);

		var parametros = settings;
		var paginas = 0;
		var cabecalho = [];
		var div = this;
		var paginaAtual = 0;

		$.fn.extend({
			setParametros : function(parametrosIn) {

				parametros = parametrosIn;

			},
			getParametros : function() {

				return parametros;
			},
			refresh : function(dadosTabela) {

				showLoading();
				
				if (dadosTabela != null) {
					parametros.dados = dadosTabela;
				}

				getTabela(paginaAtual);
			}
		});

		$(this).each(function(txt) {

			showLoading();
			getTabela(paginaAtual);
		});

		function showLoading() {

			$(div).html('<div class="loader"><img src="imagens/ajax-loader.gif">' + parametros.mensagemCarregando + '</div>');
			$(window).trigger('resize');
		}

		function getTabela(pagina) {

			if (parametros.dados != null) {

				json = parametros.dados;
				paginaAtual = pagina;
				getCabecalho(parametros.dados);
				showTable(parametros.dados);

			} else {

				settings.parametros['pagina'] = pagina;

				$.ajax({
					type : "GET",
					url : parametros.url,
					data : parametros.parametros,
					async: parametros.async,
					success : function(resposta) {

						json = resposta;
						paginas = json.total;
						paginaAtual = pagina;

						getCabecalho(json.tabela);

						showTable(json.tabela);
					},
					error : function(XMLHttpRequest, textStatus, errorThrown) {

					}
				});
			}
		}

		function selecionaTodos(elem) {

			id = '.jTableCheck' + $(elem).attr('rel');
			$(div).find(id).prop("checked", elem.checked);

		}

		function showTable(json) {

			var conteudo = "";
			var colunas = cabecalho.length - 1;

			if (settings.editar || settings.remover
					|| (settings.opcoes.length > 0)) {

				colunas++;
			}

			if (json.length <= 0) {

				if (paginaAtual > 0) {

					paginaAtual = 0;
					getTabela(paginaAtual);

				} else {

					conteudo = '<b class="tabelaVazia">' + parametros.mensagemEmpty + '</b>';

					$(div).html(conteudo);
				}
				return false;
			}

			conteudo += "<TABLE>";
			
			// Cria o cabecalho da grid
			
			conteudo += "<TR>";
			for ( var i = 0; i < cabecalho.length; i++) {

				conteudo += '<TH class="' + cabecalho[i].align;

				if (i == colunas) {
					conteudo += ' last';
				}

				conteudo += '" style="width:' + cabecalho[i].width + ';">';

				if (cabecalho[i].tipo == null) {

					conteudo += cabecalho[i].titulo;

				} else if (cabecalho[i].tipo == "checkbox") {

					if (cabecalho[i].titulo == null
							|| cabecalho[i].titulo == '') {

						conteudo += '<input type="checkbox" class="jTableCheckBnt" rel="'
								+ i + '" />';

					} else {

						conteudo += cabecalho[i].titulo;
					}

				} else {

					conteudo += cabecalho[i].titulo;

				}

				conteudo += '</TH>';

			}

			if (settings.opcoes.length > 0) {
				conteudo += '<TH class="center last" style="width: '
						+ settings.opcoesWidth + '">';

				if (settings.opcoesTitulo != null) {

					conteudo += settings.opcoesTitulo;

				} else {

					conteudo += 'opções';
				}

				conteudo += '</TH>';
			}

			// old - deverá ser excluido no futuro

			if (settings.editar || settings.remover) {
				conteudo += '<TH class="center last" style="width: 80px">';

				if (settings.opcoesTitulo != null) {

					conteudo += settings.opcoesTitulo;

				} else {

					conteudo += 'opções';
				}

				conteudo += '</TH>';
			}

			conteudo += "</TR>";

			// Popula a grid com os valores
						
			for ( var i = 0; i < json.length; i++) {

				conteudo += '<TR id="' + settings.nome + '-'
						+ json[i][settings.campoRef] + '">';

				for ( var f = 0; f < cabecalho.length; f++) {

					conteudo += '<TD class="' + cabecalho[f].align;

					if (f == colunas) {
						conteudo += ' last';
					}

					conteudo += '" style="width:' + cabecalho[f].width + ';">';

					if (cabecalho[f].tipo == null || cabecalho[f].tipo == "monetario") {

						var variavelPre = "";
						var variavelPos = "";
						var conteudoVariavel = "";
						var parametro = "";
						var parametroValor = "";

						conteudoVariavel = getValor(json[i], cabecalho[f].campo);

						if (cabecalho[f].params == null) {

							parametroValor = conteudoVariavel;
							parametro = cabecalho[f].campo;

						} else {

							parametroValor = json[i][cabecalho[f].params];
							parametro = cabecalho[f].params;
						}

						if (cabecalho[f].link != null) {

							variavelPre = '<a href="' + cabecalho[f].link + '?' +  parametro + '=' + parametroValor + '" alt="' + cabecalho[f].alt + '"' + complemento + '>';
							variavelPos = '</a>';
						}

						if (cabecalho[f].link_url != null) {

							variavelPre = '<a href="' + getValor(json[i], cabecalho[f].link_url) + '">';
							variavelPos = '</a>';
						}

						if (cabecalho[f].funcao != null && cabecalho[f].funcao != "") {

							variavelPre = '<a href="javascript:;" onclick="' + cabecalho[f].funcao + '(\'' + parametro + '\')" alt="' + cabecalho[f].alt + '">';
							variavelPos = '</a>';
						}

						if (cabecalho[f].icon != null) {

							conteudoVariavel = '<img src="' + cabecalho[f].icon + '">';
						}

						if (cabecalho[f].tipo == "monetario") {

							conteudoVariavel = formataValor(conteudoVariavel);
						}

						conteudo += variavelPre + conteudoVariavel + variavelPos;

					} else if (cabecalho[f].tipo == "checkbox") {

						conteudo += '<input type="checkbox" class="jTableCheck'
								+ f + '" name="' + cabecalho[f].campo
								+ '[]" value="' + json[i][cabecalho[f].campo]
								+ '" />';

					} else if (cabecalho[f].tipo == "boolean") {

						if (json[i][cabecalho[f].campo] == 'true'
								|| json[i][cabecalho[f].campo] == true) {
							conteudo += '<div class="tabelaCheck"></div>';
						}
					}

					conteudo += '</TD>';
				}

				if (settings.opcoes.length > 0) {

					conteudo += '<TD class="center last" style="width: 50px">';

					var linkParams = "";
					var link = "";

					for (x in settings.opcoes) {

						if (settings.opcoes[x].ajax == 'true') {
							link = 'javascript:;';
						} else {

							if (settings.opcoes[x].params != null
									&& settings.opcoes[x].params.length > 0) {

								linkParams = "?";

								for (y in settings.opcoes[x].params) {

									if (y > 0) {
										linkParams += '&';
									}

									linkParams += settings.opcoes[x].params[y]
											+ '='
											+ json[i][settings.opcoes[x].params[y]];
								}
							}

							link = settings.opcoes[x].link + linkParams;
						}

						var complemento="";

						if (settings.opcoes[x].target != null) {
							complemento += ' target="' + settings.opcoes[x].target + '"';
						}

						if (settings.opcoes[x].funcao != null && settings.opcoes[x].funcao != "") {

							var contador = 0;
							complemento += ' onclick="' + settings.opcoes[x].funcao + '(';

							for (y in settings.opcoes[x].params) {

								if (contador > 0) {
									complemento += ",";
								}
								complemento += '\'' + json[i][settings.opcoes[x].params[y]] + '\'';
								contador++;
							}

							complemento += ');"';
						}

						conteudo += '<a href="' + link + '" style="margin: 0 5px;" ' + complemento + '>';
						conteudo += '<img src="' + settings.opcoes[x].icon
								+ '" alt="' + settings.opcoes[x].alt
								+ '" title="' + settings.opcoes[x].alt + '">';
					}

					conteudo += '</TD>';

				}

				if (settings.editar || settings.remover) {
					conteudo += '<TD class="center last" style="width: 50px">';

					if (settings.editar) {
						conteudo += '<a href="' + settings.linkEditar + '?'
								+ settings.campoRef + '='
								+ json[i][settings.campoRef]
								+ '" style="margin-right: 10px;">';
						conteudo += '<img src="' + settings.iconEditar
								+ '" alt="excluir">';
						conteudo += '</a>';
					}

					if (settings.remover) {
						conteudo += '<a href="javascript:;" onclick="'
								+ settings.funcaoRemover + '(\''
								+ json[i][settings.campoRef] + '\', \''
								+ json[i][settings.campoTituloRef] + '\');">';
						conteudo += '<img src="' + settings.iconExcluir
								+ '" alt="excluir">';
						conteudo += '</a>';
					}

					conteudo += '</TD>';
				}
				conteudo += "</TR>";
			}

			conteudo += "</TABLE>";

			// Cria a paginação da grid
			
			if (paginas > 0) {

				conteudo += '<div class="pagination pagination-left">';
				conteudo += '<ul class="pager">';

				if (paginaAtual <= 0) {

					conteudo += '<li class="disabled"><a href=""><< ant.</a></li>';

				} else {

					conteudo += '<li><a href="" rel="0">inicio</a></li>';
					conteudo += '<li><a href="" rel="' + (paginaAtual - 1) + '"><< ant.</a></li>';
				}

				var classe = "";

				if (paginas <= 10) {

					for ( var i = 0; i < paginas; i++) {

						if (paginaAtual == i) {
							classe = ' class="current"';
						} else {
							classe = "";
						}
						conteudo += '<li' + classe + '><a href="" rel="' + (i)
								+ '">' + (i + 1) + '</a></li>';
					}

				} else {

					var inicio = 0;

					if (paginaAtual <= 5) {

						inicio = 0;

					} else if (parseInt(paginaAtual + 1) >= paginas) {

						inicio = paginas - 10;

					} else {

						inicio = paginaAtual - 5;
					}

					var fim = inicio + 10;

					for ( var i = inicio; i < fim; i++) {

						if (paginaAtual == i) {
							classe = ' class="current"';
						} else {
							classe = "";
						}
						conteudo += '<li' + classe + '><a href="" rel="' + (i)
								+ '">' + (i + 1) + '</a></li>';
					}

					conteudo += '<li>...</li>';
				}

				if (paginaAtual >= (paginas - 1)) {

					conteudo += '<li class="disabled"><a href="">prox. >></a></li>';

				} else {

					conteudo += '<li><a href="" rel="' + (parseInt(paginaAtual) + 1) + '">prox. >></a></li>';

					conteudo += '<li><a href="" rel="' + (parseInt(paginas) - 1) + '">fim</a></li>';
				}

				conteudo += '</ul>';
				conteudo += '</div>';

			}

			// --
			
			$(div).html(conteudo);
			$(window).trigger('resize');

			$(div).find('.jTableCheckBnt').click(function() {

				selecionaTodos(this);
			});

			var elemTemp = $(div).find('.pager').find('li').find('a');

			for ( var i = 0; i < elemTemp.length; i++) {

				$(elemTemp[i]).click(function() {

					pagina = $(this).attr('rel');
					if (pagina != "" && pagina != null) {

						getTabela(pagina);
					}

					return false;
				});
			}

		}

		function getValor(json, campo) {

			var conteudoVariavel = "";

			if (campo.lastIndexOf(".") > 0) {

				listaCampos = campo.split(".");
				var variavel = json;

				for ( var y = 0; y < listaCampos.length; y++) {

					if (variavel[listaCampos[y]] != null) {
						variavel = variavel[listaCampos[y]];
					} else {
						variavel = "";
					}
				}

				conteudoVariavel = variavel;

			} else {

				if (json[campo] != null) {
					conteudoVariavel = json[campo];
				}
			}

			return conteudoVariavel;
		}

		function getCabecalho() {

			if (cabecalho.length <= 0
					&& (settings.cabecalho == null || settings.cabecalho.length <= 0)) {

				for ( var member in json.list[0]) {

					var obj = {
						'titulo' : member,
						'align' : 'left',
						'width' : 'auto',
						'campo' : member
					};
					cabecalho.push(obj);
				}
			} else {

				cabecalho = settings.cabecalho;
			}

		}

		function formataValor(valor) {

			valorProd = (Math.round(valor*100)).toString();
			valorString = "R$ " + valorProd.substring(0, valorProd.length-2) + "," + valorProd.toString().substring(valorProd.length-2, valorProd.length);

			return valorString;
		}
	};
})(jQuery);