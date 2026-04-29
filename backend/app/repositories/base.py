from sqlmodel import Session, select, SQLModel


class BaseRepository:
    def __init__(self, session: Session, model):
        self.session = session
        self.model = model

    def get_by_id(self, id: int):
        return self.session.get(self.model, id)

    def save(self, entity: SQLModel):
        self.session.add(entity)

    def delete(self, entity: SQLModel):
        self.session.delete(entity)
