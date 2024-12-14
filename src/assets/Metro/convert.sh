

for i in *.wav  
do 
root=`basename ${i} .wav` 
echo ${root}
sox ${i} ${root}.mp3

done
