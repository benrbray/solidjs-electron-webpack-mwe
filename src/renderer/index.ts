import Renderer from './render';

////////////////////////////////////////////////////////////

let renderer:Renderer;

onload = function(){
	renderer = new Renderer();
	renderer.init();
}