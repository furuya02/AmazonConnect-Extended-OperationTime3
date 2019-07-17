
#--------------- Lambdaのみ更新 ---------------------------
# export Profile=profile-name
# export ZipName=/tmp/upload.zip
# export FunctionNam=finction-name

# rm ${ZipName} 
# cd dst
# zip -r ${ZipName} *
# aws lambda update-function-code --function-name ${FunctionNam}  --zip-file fileb://${ZipName} --publish --p ${Profile}
