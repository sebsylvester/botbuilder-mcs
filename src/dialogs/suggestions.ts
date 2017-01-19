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
        imageUrl: 'https://cloud.githubusercontent.com/assets/3374297/22075974/74a54d56-ddae-11e6-92c1-d89fd57d0383.jpg'
    },
    { 
        title: 'Mark Zuckerberg', 
        subtitle: 'Facebook', 
        imageUrl: 'https://cloud.githubusercontent.com/assets/3374297/22075978/74caf556-ddae-11e6-9b7b-c5d7eb8e8eef.jpg'
    },
    { 
        title: 'Jack Dorsey', 
        subtitle: 'Twitter, Square', 
        imageUrl: 'https://cloud.githubusercontent.com/assets/3374297/22075975/74bc6392-ddae-11e6-8353-212de4717597.jpg'
    },
    { 
        title: 'Travis Kalanick', 
        subtitle: 'Uber', 
        imageUrl: 'https://cloud.githubusercontent.com/assets/3374297/22075977/74cac8ba-ddae-11e6-9745-19dd19055bb9.jpg'
    },
    { 
        title: 'Kevin Systrom', 
        subtitle: 'Instagram', 
        imageUrl: 'https://cloud.githubusercontent.com/assets/3374297/22075976/74c93be4-ddae-11e6-9793-d9c16c9c8074.jpg'
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