import Subscriber from '../../src/lib/Subscriber';
import { getRandomChannelName, MockPublisher } from './support/testUtils';

describe('presence', () => {
  let subscriber: Subscriber;
  let publisher: MockPublisher;

  before(async function () {
    this.timeout(5000);
    const key = AblyTestApp.keys[0].keyStr;

    subscriber = new Subscriber({
      ablyOptions: {
        key,
        environment: 'sandbox',
        clientId: 'someClient',
      },
    });

    publisher = new MockPublisher(key);
  });

  it('enters channel presence on start', (done) => {
    const channel = getRandomChannelName();
    publisher.onSubscriberPresenceEnter(channel, async () => {
      await subscriber.stop();
      done();
    });
    subscriber.start(channel);
  });

  it('leaves channel presence on stop', (done) => {
    const channel = getRandomChannelName();
    publisher.onSubscriberPresenceLeave(channel, done);
    subscriber.start(channel).then(() => {
      subscriber.stop();
    });
  });

  it('calls onStatusUpdate when publisher is already present', (done) => {
    const channel = getRandomChannelName();
    subscriber.onStatusUpdate = (status) => {
      if (status) done();
    };
    publisher.enterPresence(channel).then(() => {
      subscriber.start(channel);
    });
  });

  it('calls onStatusUpdate when publisher enters presence', (done) => {
    const channel = getRandomChannelName();
    subscriber.onStatusUpdate = (status) => {
      if (status) done();
    };
    subscriber.start(channel).then(() => {
      publisher.enterPresence(channel);
    });
  });

  it('calls onStatusUpdate when publisher leaves presence', (done) => {
    const channel = getRandomChannelName();
    publisher.enterPresence(channel);
    subscriber.onStatusUpdate = (status) => {
      if (!status) done();
    };
    subscriber.start(channel).then(() => {
      publisher.leavePresence(channel);
    });
  });
});
