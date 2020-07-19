import solidJsDom from "solid-js/dom";
import Renderer from './render';

////////////////////////////////////////////////////////////

let renderer;

onload = function(){
	renderer = new Renderer();
	renderer.init();
}