# Ferris-Wheel

Please check the pdf for elaborated description
 
I created the ferris wheel from scratch and added all points in the buffer. For the skeleton of wheel, I am creating 4 polygons and adding diagonal lines to make it 3D. For cart, I am creating a single cart at center and translating it to the end points of diagonals. I am rotating all the points in vertex shader by using matrices for wheel rotation and inverse rotation specific for carts to make them steady as result of gravity. To implement the perspective animation, I am incrementing the angle of camera, then creating matrix for it and using inverse of that matrix to rotate the entire wheel.
