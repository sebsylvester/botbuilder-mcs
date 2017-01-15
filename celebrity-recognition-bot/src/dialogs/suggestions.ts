import { 
    AttachmentLayout, 
    CardAction, 
    CardImage, 
    HeroCard, 
    Message, 
    Session 
} from 'botbuilder';

interface CardInfo { 
    title: string; 
    subtitle: string; 
    imageUrl: string; 
}

// Sample data used for presenting the suggestions
const techRockstars: CardInfo[] = [
    { 
        title: 'Elon Musk', 
        subtitle: 'Tesla, SpaceX', 
        imageUrl: 'https://cloud.githubusercontent.com/assets/3374297/21751313/a2d3ba0a-d5c5-11e6-9646-68bdc1ee1beb.jpg'
    },
    { 
        title: 'Mark Zuckerberg', 
        subtitle: 'Facebook', 
        imageUrl: 'https://cloud.githubusercontent.com/assets/3374297/21751312/a2d3c626-d5c5-11e6-9a60-00dff4082e26.jpg'
    },
    { 
        title: 'Jack Dorsey', 
        subtitle: 'Twitter, Square', 
        imageUrl: 'https://cloud.githubusercontent.com/assets/3374297/21751314/a2d50fea-d5c5-11e6-9f4d-8a3577ddae08.jpg'
    },
    { 
        title: 'Travis Kalanick', 
        subtitle: 'Uber', 
        imageUrl: 'https://cloud.githubusercontent.com/assets/3374297/21751315/a2d576d8-d5c5-11e6-9a44-1f4ef8c5dfa4.jpg'
    },
    { 
        title: 'Kevin Systrom', 
        subtitle: 'Instagram', 
        imageUrl: 'https://cloud.githubusercontent.com/assets/3374297/21751311/a2d3acf4-d5c5-11e6-94fd-d041c1b12efa.jpg'
    }
];

// The /suggestions dialog handler
export const suggestions = (session: Session) => {
    // Map all array items to a HeroCard
    const cards = techRockstars.map(cardInfo => {
        const image = new CardImage().url(cardInfo.imageUrl).alt(cardInfo.title);
        const action = CardAction.dialogAction(session, 'newRequest', cardInfo.imageUrl, 'Select');

        return new HeroCard(session)
            .title(cardInfo.title)
            .subtitle(cardInfo.subtitle)
            .images([image])
            .buttons([action]);
    });

    const message = new Message(session)
                .attachmentLayout(AttachmentLayout.carousel)
                .attachments(cards);

    session.endDialog(message);
};