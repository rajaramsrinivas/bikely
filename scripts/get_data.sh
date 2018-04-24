mkdir ../data
wget https://s3.amazonaws.com/fordgobike-data/2017-fordgobike-tripdata.csv
mv 2017-fordgobike-tripdata.csv ../data/
wget https://s3.amazonaws.com/fordgobike-data/201801_fordgobike_tripdata.csv.zip
mv 201801_fordgobike_tripdata.csv.zip ../data/
wget https://s3.amazonaws.com/fordgobike-data/201802_fordgobike_tripdata.csv.zip
mv 201802_fordgobike_tripdata.csv.zip ../data/
wget https://s3.amazonaws.com/fordgobike-data/201803_fordgobike_tripdata.csv.zip
mv 201803_fordgobike_tripdata.csv.zip ../data/
unzip ../data/201801_fordgobike_tripdata.csv.zip 
unzip ../data/201802_fordgobike_tripdata.csv.zip 
unzip ../data/201803_fordgobike_tripdata.csv.zip
