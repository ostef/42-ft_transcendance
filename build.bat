pushd backend
call npm install
start cmd /C npm run start:dev
popd

pushd frontend
call npm install
start cmd /C npm run dev
popd

