from app import create_app


app = create_app()
# register the Dubai blueprint
if __name__ == '__main__':
    app.run(debug=True, port=5000)
