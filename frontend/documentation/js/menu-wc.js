'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">front documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="index.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ClientesFormComponent.html" data-type="entity-link" >ClientesFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ClientesListComponent.html" data-type="entity-link" >ClientesListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ComprasFormComponent.html" data-type="entity-link" >ComprasFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ComprasListComponent.html" data-type="entity-link" >ComprasListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CrecimientoClientesCharComponent.html" data-type="entity-link" >CrecimientoClientesCharComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DashboardComponent.html" data-type="entity-link" >DashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GraficoBurbujasCharComponent.html" data-type="entity-link" >GraficoBurbujasCharComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/InteraccionesFormComponent.html" data-type="entity-link" >InteraccionesFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/InteraccionesListComponent.html" data-type="entity-link" >InteraccionesListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginComponent.html" data-type="entity-link" >LoginComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LogoutComponent.html" data-type="entity-link" >LogoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MetricsTableComponent.html" data-type="entity-link" >MetricsTableComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductosFormComponent.html" data-type="entity-link" >ProductosFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductosListComponent.html" data-type="entity-link" >ProductosListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProveedorFormComponent.html" data-type="entity-link" >ProveedorFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProveedorListComponent.html" data-type="entity-link" >ProveedorListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ShellComponent.html" data-type="entity-link" >ShellComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StockDisponibleCharComponent.html" data-type="entity-link" >StockDisponibleCharComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VentasFormComponent.html" data-type="entity-link" >VentasFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VentasListComponent.html" data-type="entity-link" >VentasListComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/ApiService.html" data-type="entity-link" >ApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ComprasService.html" data-type="entity-link" >ComprasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CustomerService.html" data-type="entity-link" >CustomerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/InteraccionesService.html" data-type="entity-link" >InteraccionesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetricsService.html" data-type="entity-link" >MetricsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductosService.html" data-type="entity-link" >ProductosService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProveedoresService.html" data-type="entity-link" >ProveedoresService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TranslationService.html" data-type="entity-link" >TranslationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VentasService.html" data-type="entity-link" >VentasService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Cliente.html" data-type="entity-link" >Cliente</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Compra.html" data-type="entity-link" >Compra</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Interaccion.html" data-type="entity-link" >Interaccion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/JwtPayload.html" data-type="entity-link" >JwtPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoginResponse.html" data-type="entity-link" >LoginResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Producto.html" data-type="entity-link" >Producto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Proveedor.html" data-type="entity-link" >Proveedor</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TranslationResponse.html" data-type="entity-link" >TranslationResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Venta.html" data-type="entity-link" >Venta</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});