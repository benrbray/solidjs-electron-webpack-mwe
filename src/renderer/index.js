import Renderer from './render';

////////////////////////////////////////////////////////////

let renderer;

onload = function(){
	renderer = new Renderer();
	renderer.init();
}