#!/bin/sh

mkdir -p png-out
for FILE in app/assets/src/weather/*.svg; do
    inkscape -e png-out/$(printf "%02d" $(basename $FILE .svg)).png -w 22 -h 22 $FILE
done
rm app/assets/img/weather-icons.png
gm convert png-out/*.png -sharpen 1x0.5 +append app/assets/img/weather-icons.png

rm png-out/*.png
rmdir png-out
