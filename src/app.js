import Sketch1 from './hex-by-instances/sketch';
import Sketch2 from './hex-by-shader/sketch';
import sketchSwitcher from './lib/sketch-switcher';

sketchSwitcher([Sketch1, Sketch2], 'container');
