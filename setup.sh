npx ejs ./.devcontainer/devcontainer.json -o ./.devcontainer/devcontainer.json -f ./package.json

rm -f ./setup.sh

echo 'Setup completed'