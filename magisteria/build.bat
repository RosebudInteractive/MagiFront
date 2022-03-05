@echo Started: %date% %time%
mkdir build
@echo --------------------
@echo install root modules
@echo --------------------
call yarn

cd common
@echo ----------------------
@echo install common modules
@echo ----------------------
call yarn

cd ../magisteria
@echo ------------------
@echo install magisteria
@echo ------------------
call yarn

cd ../back-office
@echo ------------------
@echo install back-office
@echo ------------------
call yarn
cd ../magisteria
@echo ------------------
@echo build magisteria
@echo ------------------
copy babel6.babelrc .babelrc
call yarn build
xcopy /E /Y build ..\build
copy babel7.babelrc .babelrc

cd ../mag-adm
@echo ------------------
@echo install mag-adm
@echo ------------------
call yarn
@echo ------------------
@echo build mag-adm
@echo ------------------
call yarn build
xcopy /E /Y /i build\static ..\build\static
copy build\index.html ..\build\adm-index.html


@echo ------------------
@echo build back-office
@echo ------------------
call yarn build
xcopy /E /Y build\static ..\build\static
copy build\index.html ..\build\pm-index.html

cd ../mobile-test-app
@echo -----------------------
@echo install mobile-test-app
@echo -----------------------
call yarn
@echo ---------------------
@echo build mobile-test-app
@echo ---------------------
call yarn build
xcopy /E /Y build\static ..\build\static
copy build\index.html ..\build\test-index.html

cd ../mailing
@echo -----------------------
@echo install mailing
@echo -----------------------
call yarn
@echo ---------------------
@echo build mailing
@echo ---------------------
call yarn build
xcopy /E /Y build\static ..\build\static
copy build\index.html ..\build\mail-index.html

cd ..

@echo Finished: %date% %time%
